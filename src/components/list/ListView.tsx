import { cx, TONE_CLASS } from "../../lib/styles";
import { useConfigStore } from "../../store/useConfigStore";
import { useTaskStore, type Task } from "../../store/useTaskStore";
import { CountBadge, DoneCheck, DueLabel, PriorityChip, TaskTitle } from "../ui/TaskBits";

interface ListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function ListView({ tasks, onEdit }: ListViewProps) {
  const columns = useConfigStore((s) => s.columns);
  const toggleDone = useTaskStore((s) => s.toggleDone);

  if (tasks.length === 0) {
    return <p className="text-ink-soft">No tasks match your search. Try another word or priority.</p>;
  }

  return (
    <main className="flex max-w-[900px] flex-col gap-7">
      {columns.map((col) => {
        const group = tasks.filter((t) => t.status === col.id);
        if (group.length === 0) return null;
        return (
          <section key={col.id} className={TONE_CLASS[col.tone]}>
            <h2 className="mb-2.5 flex items-center gap-3 font-display text-xl leading-[1.2] font-bold text-tone-ink">
              <CountBadge count={group.length} className="bg-tone" />
              {col.title}
            </h2>
            <ul className="rounded-card bg-surface shadow-card">
              {group.map((task) => (
                <li
                  key={task.id}
                  className={cx(
                    "flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 not-first:border-t not-first:border-bg",
                    "tablet:flex-nowrap tablet:gap-3.5",
                  )}
                >
                  <DoneCheck task={task} onToggle={toggleDone} />
                  <TaskTitle task={task} onEdit={onEdit} className="flex-1 basis-[calc(100%-50px)] tablet:basis-0" />
                  <DueLabel task={task} className="mr-auto ml-[46px] tablet:m-0" />
                  <PriorityChip priority={task.priority} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
