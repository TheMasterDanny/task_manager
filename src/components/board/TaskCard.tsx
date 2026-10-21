import { cx } from "../../lib/styles";
import type { Task } from "../../store/useTaskStore";
import { DoneCheck, DueLabel, PriorityChip, TaskTitle } from "../ui/TaskBits";
import type { DnD } from "./Board";

export const DropSlot = () => (
  <div className="h-16 rounded-card border-2 border-dashed border-tone-ink bg-white/45 opacity-70" />
);

interface TaskCardProps {
  task: Task;
  dnd: DnD;
  onEdit: (task: Task) => void;
  onToggle: (id: string) => void;
}

export function TaskCard({ task, dnd, onEdit, onToggle }: TaskCardProps) {
  const showSlot = dnd.dropTarget?.beforeId === task.id && dnd.dragId !== task.id;

  return (
    <>
      {showSlot && <DropSlot />}
      <article
        className={cx(
          "flex flex-col gap-3.5 rounded-card bg-surface px-3.5 pt-3.5 pb-3 shadow-card tablet:cursor-grab tablet:active:cursor-grabbing",
          dnd.dragId === task.id && "opacity-40",
        )}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          dnd.start(task.id);
        }}
        onDragEnd={dnd.end}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dnd.over(task.status, task.id);
        }}
      >
        <TaskTitle task={task} onEdit={onEdit} />

        <div className="flex items-center gap-2">
          <DueLabel task={task} className="mr-auto" />
          <PriorityChip priority={task.priority} />
          <DoneCheck task={task} onToggle={onToggle} />
        </div>
      </article>
    </>
  );
}
