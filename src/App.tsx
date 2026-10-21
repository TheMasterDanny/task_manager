import { useMemo, useState } from "react";
import { Board } from "./components/board/Board";
import { Header } from "./components/Header";
import { ListView } from "./components/list/ListView";
import { TaskDialog, type TaskDraft } from "./components/TaskDialog";
import { Toolbar, type PriorityFilter, type View } from "./components/Toolbar";
import { useTaskStore, type TaskInput } from "./store/useTaskStore";

function App() {
  const tasks = useTaskStore((s) => s.tasks);
  const saveTask = useTaskStore((s) => s.saveTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

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
      <Header total={tasks.length} done={doneCount} onNewTask={() => setEditing({ status: "todo" })} />

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
