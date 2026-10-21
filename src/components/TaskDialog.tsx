import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { chipClass, cx, fieldControlClass } from "../lib/styles";
import { useConfigStore, type PriorityIds } from "../store/useConfigStore";
import type { Task, TaskInput } from "../store/useTaskStore";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";

/** An existing task, or the fields to prefill a new one with. */
export type TaskDraft = Partial<Task> & Pick<Task, "status">;

interface TaskDialogProps {
  task: TaskDraft;
  onSave: (data: TaskInput) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const labelTextClass = "mb-1.5 p-0 text-[13.5px] font-semibold text-ink-soft";

export function TaskDialog({ task, onSave, onDelete, onClose }: TaskDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const columns = useConfigStore((s) => s.columns);
  const priorities = useConfigStore((s) => s.priorities);
  const isNew = !task.id;
  const [form, setForm] = useState<TaskInput>({
    title: "",
    priority: "medium",
    date: "",
    time: "",
    ...task,
  });

  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const set =
    (key: keyof TaskInput) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim() });
  };

  return (
    <dialog
      ref={ref}
      className={cx(
        // phone: bottom sheet
        "mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-surface px-5 pt-6 pb-[calc(20px+env(safe-area-inset-bottom))] text-ink shadow-dialog open:animate-sheet",
        // tablet and up: centered card
        "tablet:m-auto tablet:max-h-[calc(100%-2em)] tablet:w-[min(520px,calc(100%-32px))] tablet:rounded-col tablet:p-7 tablet:open:animate-pop",
        "backdrop:bg-ink/35 backdrop:backdrop-blur-[3px]",
      )}
      onCancel={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <form onSubmit={submit} className="flex flex-col gap-[18px]">
        <h2 className="mb-5 font-display text-[26px] leading-[1.1] font-bold tracking-[-0.02em]">
          {isNew ? "New task" : "Edit task"}
        </h2>

        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className={labelTextClass}>Title</span>
          <textarea
            rows={2}
            className={cx(fieldControlClass, "resize-y text-base font-medium")}
            value={form.title}
            onChange={set("title")}
            placeholder="What needs to be done?"
            autoFocus
            required
          />
        </label>

        <div className="flex flex-col gap-3.5 tablet:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className={labelTextClass}>Status</span>
            <Select value={form.status} onChange={set("status")}>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </label>

          <fieldset className="flex min-w-0 flex-1 flex-col gap-1.5">
            <legend className={labelTextClass}>Priority</legend>
            <div className="flex gap-1.5">
              {(Object.entries(priorities) as [PriorityIds, string][]).map(([value, label]) => (
                <label
                  key={value}
                  className={cx(
                    chipClass(value),
                    "flex-1 cursor-pointer justify-center px-3 py-[11px] opacity-55 tablet:flex-none tablet:py-[9px]",
                    "has-checked:opacity-100 has-checked:shadow-[inset_0_0_0_1.5px_currentColor]",
                    "has-focus-visible:outline-[2.5px] has-focus-visible:outline-offset-2 has-focus-visible:outline-brand has-focus-visible:outline-solid",
                  )}
                >
                  <input
                    type="radio"
                    name="priority"
                    className="pointer-events-none absolute opacity-0"
                    value={value}
                    checked={form.priority === value}
                    onChange={set("priority")}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-3.5 tablet:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className={labelTextClass}>Due date</span>
            <input type="date" className={cx(fieldControlClass, "h-[42px]")} value={form.date} onChange={set("date")} />
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className={labelTextClass}>Time</span>
            <input type="time" className={cx(fieldControlClass, "h-[42px]")} value={form.time} onChange={set("time")} />
          </label>
        </div>

        <div className="mt-1.5 flex justify-end gap-2">
          {task.id && (
            <Button type="button" variant="danger" onClick={() => onDelete(task.id!)}>
              Delete
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="justify-center max-tablet:flex-1">
            {isNew ? "Add task" : "Save changes"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
