import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  tasks: Task[];
  saveTask: (data: TaskInput) => void;
  deleteTask: (id: string) => void;
  toggleDone: (id: string) => void;
  /** Moves a task to `status`, placed before `beforeId` (or at the end when null). */
  moveTask: (id: string, status: CardIds, beforeId: string | null) => void;
}

const uid = () => crypto.randomUUID();

// Tasks are saved to localStorage under this key.
export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],

      saveTask: (data) =>
        set((state) => ({
          tasks: data.id
            ? state.tasks.map((t) => (t.id === data.id ? { ...t, ...data, id: t.id } : t))
            : [...state.tasks, { ...data, id: uid() }],
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      toggleDone: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t;
            return t.status === "done"
              ? { ...t, status: t.prevStatus || "todo" }
              : { ...t, status: "done", prevStatus: t.status };
          }),
        })),

      moveTask: (id, status, beforeId) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task || id === beforeId) return state;
          const rest = state.tasks.filter((t) => t.id !== id);
          const moved = { ...task, status };
          const index = beforeId ? rest.findIndex((t) => t.id === beforeId) : -1;
          if (index === -1) return { tasks: [...rest, moved] };
          return { tasks: [...rest.slice(0, index), moved, ...rest.slice(index)] };
        }),
    }),
    {
      name: "task-manager-tasks",
      partialize: (state) => ({ tasks: state.tasks }),
    },
  ),
);
