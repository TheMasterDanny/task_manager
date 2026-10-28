import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, ApiError } from "../lib/api";
import type { CardIds, PriorityIds } from "./useConfigStore";

export interface Task {
  id: string;
  title: string;
  status: CardIds;
  priority: PriorityIds;
  date: string;
  time: string;
  prevStatus?: CardIds;
}

/** A task being created (no id yet) or edited. */
export type TaskInput = Omit<Task, "id"> & { id?: string };

interface TaskState {
  /** The tasks on screen: the guest's, or the signed-in account's. */
  tasks: Task[];
  /** The guest's tasks, saved on this device. Kept untouched while signed in. */
  guestTasks: Task[];
  source: "guest" | "account";
  loading: boolean;
  error: string | null;
  /** Set on sign up to upload the guest's tasks to the new account. */
  importOnSignIn: boolean;

  saveTask: (data: TaskInput) => void;
  deleteTask: (id: string) => void;
  toggleDone: (id: string) => void;
  /** Moves a task to `status`, placed before `beforeId` (or at the end when null). */
  moveTask: (id: string, status: CardIds, beforeId: string | null) => void;

  showGuestTasks: () => void;
  showAccountTasks: () => void;
  dismissError: () => void;
}

const uid = () => crypto.randomUUID();

/** The fields the API accepts for a task (no id). */
const fields = ({ title, status, priority, date, time }: TaskInput) => ({ title, status, priority, date, time });

function toggled(t: Task): Task {
  return t.status === "done"
    ? { ...t, status: t.prevStatus || "todo" }
    : { ...t, status: "done", prevStatus: t.status };
}

function moved(tasks: Task[], id: string, status: CardIds, beforeId: string | null) {
  const task = tasks.find((t) => t.id === id);
  if (!task || id === beforeId) return tasks;
  const rest = tasks.filter((t) => t.id !== id);
  const index = beforeId ? rest.findIndex((t) => t.id === beforeId) : -1;
  if (index === -1) return [...rest, { ...task, status }];
  return [...rest.slice(0, index), { ...task, status }, ...rest.slice(index)];
}

// Requests to the API run one at a time, in the order the changes were made.
let queue = Promise.resolve();
// Bumped when switching between guest and account, so requests from before are dropped.
let session = 0;

// Guest tasks are saved to localStorage under this key.
export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => {
      /** Updates the tasks on screen, and saves them on this device in guest mode. */
      const apply = (update: (tasks: Task[]) => Task[]) =>
        set((s) => {
          const tasks = update(s.tasks);
          return s.source === "guest" ? { tasks, guestTasks: tasks } : { tasks };
        });

      /** In account mode, queues a request. If it fails, reloads the tasks from the server. */
      const sync = (request: (current: () => boolean) => Promise<void>) => {
        if (get().source !== "account") return;
        const mine = session;
        const current = () => mine === session;
        queue = queue.then(async () => {
          if (!current()) return;
          try {
            await request(current);
          } catch (err) {
            // A 401 already sent the person back to the welcome screen.
            if (!current() || (err instanceof ApiError && err.status === 401)) return;
            set({ error: err instanceof ApiError && err.status === 0 ? err.message : "Couldn't save your last change." });
            await load(current);
          }
        });
      };

      const load = async (current: () => boolean) => {
        try {
          const { tasks } = await api<{ tasks: Task[] }>("GET", "/tasks");
          if (current()) set({ tasks, loading: false });
        } catch (err) {
          if (current() && !(err instanceof ApiError && err.status === 401))
            set({ loading: false, error: err instanceof ApiError ? err.message : "Couldn't load your tasks." });
        }
      };

      return {
        tasks: [],
        guestTasks: [],
        source: "guest",
        loading: false,
        error: null,
        importOnSignIn: false,

        saveTask: (data) => {
          if (data.id || get().source === "guest") {
            apply((tasks) =>
              data.id
                ? tasks.map((t) => (t.id === data.id ? { ...t, ...data, id: t.id } : t))
                : [...tasks, { ...data, id: uid() }],
            );
          }
          // New tasks get their id from the server, so they show up once it answers.
          sync(async (current) => {
            if (data.id) {
              await api("PATCH", `/tasks/${data.id}`, fields(data));
              return;
            }
            const { task } = await api<{ task: Task }>("POST", "/tasks", fields(data));
            if (current()) set((s) => ({ tasks: [...s.tasks, task] }));
          });
        },

        deleteTask: (id) => {
          apply((tasks) => tasks.filter((t) => t.id !== id));
          sync(() => api("DELETE", `/tasks/${id}`));
        },

        toggleDone: (id) => {
          const task = get().tasks.find((t) => t.id === id);
          if (!task) return;
          const next = toggled(task);
          apply((tasks) => tasks.map((t) => (t.id === id ? next : t)));
          sync(() => api("PATCH", `/tasks/${id}`, { status: next.status, prevStatus: next.prevStatus ?? null }));
        },

        moveTask: (id, status, beforeId) => {
          apply((tasks) => moved(tasks, id, status, beforeId));
          sync(() => api("PATCH", `/tasks/${id}/move`, { status, beforeId }));
        },

        showGuestTasks: () => {
          session++;
          set((s) => ({ source: "guest", tasks: s.guestTasks, loading: false, error: null }));
        },

        showAccountTasks: () => {
          session++;
          set({ source: "account", tasks: [], loading: true, error: null });
          if (!get().importOnSignIn) {
            sync(load);
            return;
          }
          // Uploads the guest's tasks. The answer is the account's full list.
          sync(async (current) => {
            const { guestTasks } = get();
            const body = { tasks: guestTasks.map((t) => ({ ...fields(t), prevStatus: t.prevStatus ?? null })) };
            try {
              const { tasks } = await api<{ tasks: Task[] }>("POST", "/tasks/import", body);
              if (current()) set({ tasks, loading: false, importOnSignIn: false });
            } catch (err) {
              set({ importOnSignIn: false });
              if (err instanceof ApiError && err.status === 401) return;
              if (current()) set({ error: "Couldn't copy your guest tasks. They're still saved on this device." });
              await load(current);
            }
          });
        },

        dismissError: () => set({ error: null }),
      };
    },
    {
      name: "task-manager-tasks",
      version: 1,
      partialize: ({ guestTasks }) => ({ guestTasks }),
      // Version 0 saved the guest's tasks as `tasks`.
      migrate: (persisted, version) =>
        version === 0 ? { guestTasks: (persisted as { tasks?: Task[] }).tasks ?? [] } : persisted,
      merge: (persisted, current) => {
        const guestTasks = (persisted as { guestTasks?: Task[] } | undefined)?.guestTasks ?? [];
        return { ...current, guestTasks, tasks: guestTasks };
      },
    },
  ),
);
