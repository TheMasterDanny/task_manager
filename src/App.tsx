import { useLayoutEffect, useMemo, useState } from "react";
import { Board } from "./components/board/Board";
import { Header } from "./components/Header";
import { ListView } from "./components/list/ListView";
import { TaskDialog, type TaskDraft } from "./components/TaskDialog";
import { Toolbar, type PriorityFilter, type View } from "./components/Toolbar";
import { Welcome } from "./components/Welcome";
import { API_URL } from "./lib/api";
import { useAuthStore } from "./store/useAuthStore";
import { useTaskStore, type TaskInput } from "./store/useTaskStore";

function App() {
  const savedMode = useAuthStore((s) => s.mode);
  const token = useAuthStore((s) => s.token);
  // Without an API there are no accounts: skip the welcome screen.
  const mode = API_URL ? savedMode : "guest";

  // Shows the right tasks before the first paint, so the guest's never flash on an account.
  useLayoutEffect(() => {
    const { showAccountTasks, showGuestTasks } = useTaskStore.getState();
    if (mode === "account") showAccountTasks();
    else showGuestTasks();
  }, [mode, token]);

  return mode ? <TaskManager /> : <Welcome />;
}

function TaskManager() {
  const tasks = useTaskStore((s) => s.tasks);
  const saveTask = useTaskStore((s) => s.saveTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const loading = useTaskStore((s) => s.loading);
  const error = useTaskStore((s) => s.error);
  const dismissError = useTaskStore((s) => s.dismissError);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [view, setView] = useState<View>("board");
  const [editing, setEditing] = useState<TaskDraft | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        (priority === "all" || t.priority === priority) &&
        (!q || t.title.toLowerCase().includes(q))
    );
  }, [tasks, query, priority]);

  const doneCount = tasks.filter((t) => t.status === "done").length;

  const handleSave = (data: TaskInput) => {
    saveTask(data);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 pt-6 pb-10 tablet:px-6 tablet:pt-8 tablet:pb-12 desktop:px-8 desktop:pt-10 desktop:pb-14">
      <Header
        total={tasks.length}
        done={doneCount}
        onNewTask={() => setEditing({ status: "todo" })}
        session={API_URL ? { email: user?.email ?? null, onLeave: signOut } : undefined}
      />

      {loading && (
        <p className="mb-4 rounded-ctl bg-sky px-3.5 py-2.5 text-sm font-medium text-sky-ink" role="status">
          Loading your tasks…
        </p>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-ctl bg-high-bg px-3.5 py-2.5 text-sm font-medium text-high-ink" role="alert">
          <span className="flex-1">{error}</span>
          <button className="font-semibold hover:underline" onClick={dismissError}>
            Dismiss
          </button>
        </div>
      )}

      <Toolbar
        query={query}
        onQueryChange={setQuery}
        priority={priority}
        onPriorityChange={setPriority}
        view={view}
        onViewChange={setView}
      />

      {view === "board" ? (
        <Board
          tasks={visible}
          filtering={Boolean(query) || priority !== "all"}
          onAdd={(status) => setEditing({ status })}
          onEdit={setEditing}
        />
      ) : (
        <ListView tasks={visible} onEdit={setEditing} />
      )}

      {editing && (
        <TaskDialog
          task={editing}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

export default App
