import { Button } from "./ui/Button";
import { PlusIcon } from "./ui/icons";

interface HeaderProps {
  total: number;
  done: number;
  onNewTask: () => void;
  /** Who is using the app: an email, or null for a guest. Hidden when accounts aren't available. */
  session?: { email: string | null; onLeave: () => void };
}

export function Header({ total, done, onNewTask, session }: HeaderProps) {
  return (
    <header className="mb-5 flex items-center justify-between gap-4 tablet:mb-7 tablet:items-end">
      <div className="min-w-0">
        <h1 className="font-display text-[44px] leading-[0.9] font-extrabold tracking-[-0.035em] tablet:text-[clamp(44px,6vw,72px)]">
          Tasks
        </h1>
        <p className="mt-1.5 text-sm font-medium text-ink-soft tablet:mt-2.5 tablet:text-[15px]">
          {total} {total === 1 ? "task" : "tasks"}, {done} done
        </p>
        {session && (
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[13px] text-ink-soft">
            <span className="truncate">{session.email ?? "Guest"}</span>
            <span aria-hidden="true">·</span>
            <button className="shrink-0 font-semibold text-brand hover:underline" onClick={session.onLeave}>
              {session.email ? "Sign out" : "Sign in"}
            </button>
          </p>
        )}
      </div>
      <Button onClick={onNewTask}>
        <PlusIcon />
        New task
      </Button>
    </header>
  );
}
