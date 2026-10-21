import { cx, TONE_CLASS } from "../../lib/styles";
import type { Column } from "../../store/useConfigStore";
import type { Task } from "../../store/useTaskStore";
import { PlusIcon } from "../ui/icons";
import { CountBadge } from "../ui/TaskBits";
import type { DnD } from "./Board";
import { DropSlot, TaskCard } from "./TaskCard";

interface BoardColumnProps {
  column: Column;
  active: boolean;
  tasks: Task[];
  filtering: boolean;
  dnd: DnD;
  onAdd: () => void;
  onEdit: (task: Task) => void;
  onToggle: (id: string) => void;
}

export function BoardColumn({ column, active, tasks, filtering, dnd, onAdd, onEdit, onToggle }: BoardColumnProps) {
  const isOver = dnd.dropTarget?.status === column.id;

  return (
    <section
      className={cx(
        "flex-col gap-3 rounded-col bg-tone px-3.5 pt-3.5 pb-4 transition-shadow tablet:flex",
        active ? "flex" : "hidden",
        isOver && "inset-ring-2 inset-ring-tone-ink",
        TONE_CLASS[column.tone],
      )}
      aria-labelledby={`col-${column.id}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isOver || dnd.dropTarget?.beforeId) {
          // hovering empty space in the column = drop at the end
          const target = e.target as HTMLElement;
          if (target === e.currentTarget || "cards" in target.dataset) {
            dnd.over(column.id, null);
          }
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        dnd.drop();
      }}
    >
      <header className="flex items-center gap-2.5 px-0.5 pt-0.5 pb-1">
        <CountBadge count={tasks.length} className="bg-surface" />
        <h2
          id={`col-${column.id}`}
          className="flex-1 font-display text-[19px] leading-[1.2] font-bold tracking-[-0.01em] text-tone-ink"
        >
          {column.title}
        </h2>
        <button
          className="grid size-10 place-items-center rounded-full text-tone-ink hover:bg-white/60 tablet:size-8"
          onClick={onAdd}
          aria-label={`Add task to ${column.title}`}
        >
          <PlusIcon />
        </button>
      </header>

      <div className="flex min-h-2 flex-col gap-2.5" data-cards>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} dnd={dnd} onEdit={onEdit} onToggle={onToggle} />
        ))}

        {isOver && !dnd.dropTarget?.beforeId && <DropSlot />}

        {tasks.length === 0 && !isOver && (
          <p className="px-2 py-[18px] text-center text-sm text-tone-ink opacity-80">
            {filtering ? "No tasks match your search." : "Drag a task here or add a new one."}
          </p>
        )}
      </div>

      <button
        className="flex h-[50px] items-center justify-center gap-2 rounded-card border-[1.5px] border-dashed border-tone-ink bg-white/35 text-sm font-semibold text-tone-ink hover:bg-white/75 tablet:h-11"
        onClick={onAdd}
      >
        <PlusIcon />
        Add task
      </button>
    </section>
  );
}
