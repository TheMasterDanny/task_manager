import { formatDue } from "../../lib/dates";
import { chipClass, cx } from "../../lib/styles";
import { useConfigStore, type PriorityIds } from "../../store/useConfigStore";
import type { Task } from "../../store/useTaskStore";
import { CheckIcon, ClockIcon } from "./icons";

/* Small pieces shared by the board card and the list row. */

export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cx(
        "grid h-10 min-w-10 place-items-center rounded-xl px-2 font-display text-[22px] leading-none font-extrabold text-tone-ink tabular-nums",
        className,
      )}
      aria-label={`${count} tasks`}
    >
      {count}
    </span>
  );
}

export function TaskTitle({ task, onEdit, className }: { task: Task; onEdit: (task: Task) => void; className?: string }) {
  const done = task.status === "done";
  return (
    <button
      className={cx(
        "text-left text-base leading-[1.35] font-semibold tablet:text-[15.5px]",
        done ? "text-ink-soft line-through decoration-[1.5px]" : "text-ink hover:text-tone-ink",
        className,
      )}
      onClick={() => onEdit(task)}
    >
      {task.title}
    </button>
  );
}

export function DueLabel({ task, className }: { task: Task; className?: string }) {
  const due = formatDue(task.date, task.time);
  const urgent = due?.urgent && task.status !== "done";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 text-[13.5px] font-medium",
        urgent ? "text-urgent" : "text-ink-soft",
        className,
      )}
    >
      {due ? (
        <>
          <ClockIcon className="size-[15px]" />
          {due.text}
        </>
      ) : (
        "No due date"
      )}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: PriorityIds }) {
  const label = useConfigStore((s) => s.priorities[priority]);
  return <span className={chipClass(priority)}>{label}</span>;
}

export function DoneCheck({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const done = task.status === "done";
  return (
    <button
      className={cx(
        "grid size-[34px] flex-none place-items-center rounded-full border-[1.75px] tablet:size-7",
        done
          ? "border-mint-ink bg-mint-ink text-white"
          : "border-line bg-surface text-transparent hover:border-mint-ink hover:text-mint-ink",
      )}
      aria-pressed={done}
      aria-label={done ? "Mark as not done" : "Mark as done"}
      onClick={() => onToggle(task.id)}
    >
      <CheckIcon className="size-4 stroke-[2.6]" />
    </button>
  );
}
