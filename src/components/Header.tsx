import { Button } from "./ui/Button";
import { PlusIcon } from "./ui/icons";

interface HeaderProps {
  total: number;
  done: number;
  onNewTask: () => void;
}

export function Header({ total, done, onNewTask }: HeaderProps) {
  return (
    <header className="mb-5 flex items-center justify-between gap-4 tablet:mb-7 tablet:items-end">
      <div>
        <h1 className="font-display text-[44px] leading-[0.9] font-extrabold tracking-[-0.035em] tablet:text-[clamp(44px,6vw,72px)]">
          Tasks
        </h1>
        <p className="mt-1.5 text-sm font-medium text-ink-soft tablet:mt-2.5 tablet:text-[15px]">
          {total} {total === 1 ? "task" : "tasks"}, {done} done
        </p>
      </div>
      <Button onClick={onNewTask}>
        <PlusIcon />
        New task
      </Button>
    </header>
  );
}
