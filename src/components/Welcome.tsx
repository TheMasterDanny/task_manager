import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api, ApiError } from "../lib/api";
import { cx, fieldControlClass } from "../lib/styles";
import { useAuthStore, type User } from "../store/useAuthStore";
import { useTaskStore } from "../store/useTaskStore";
import { Button } from "./ui/Button";

type Tab = "signin" | "signup";

const labelTextClass = "text-[13.5px] font-semibold text-ink-soft";

export function Welcome() {
  const notice = useAuthStore((s) => s.notice);
  const signedIn = useAuthStore((s) => s.signedIn);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const guestCount = useTaskStore((s) => s.guestTasks.length);

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyGuestTasks, setCopyGuestTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const slow = useSlow(busy);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const path = tab === "signin" ? "/auth/login" : "/auth/register";
      const { token, user } = await api<{ token: string; user: User }>("POST", path, { email, password });
      useTaskStore.setState({ importOnSignIn: tab === "signup" && copyGuestTasks && guestCount > 0 });
      signedIn(token, user);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setError(null);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[440px] flex-col justify-center px-4 py-10">
      <h1 className="font-display text-[56px] leading-[0.9] font-extrabold tracking-[-0.035em] tablet:text-[72px]">
        Tasks
      </h1>
      <p className="mt-2.5 mb-7 text-[15px] font-medium text-ink-soft">
        Sign in to keep your tasks on every device, or use the app as a guest.
      </p>

      <div className="rounded-col bg-surface p-5 shadow-card tablet:p-7">
        {notice && (
          <p className="mb-5 rounded-ctl bg-medium-bg px-3.5 py-2.5 text-sm font-medium text-medium-ink" role="status">
            {notice}
          </p>
        )}

        <div className="mb-6 flex rounded-ctl border border-line bg-bg p-[3px]" role="group" aria-label="Account">
          <TabButton active={tab === "signin"} onClick={() => switchTab("signin")}>Sign in</TabButton>
          <TabButton active={tab === "signup"} onClick={() => switchTab("signup")}>Create account</TabButton>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-[18px]">
          <label className="flex flex-col gap-1.5">
            <span className={labelTextClass}>Email</span>
            <input
              type="email"
              className={fieldControlClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelTextClass}>Password</span>
            <input
              type="password"
              className={fieldControlClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === "signin" ? "current-password" : "new-password"}
              minLength={tab === "signup" ? 8 : undefined}
              maxLength={128}
              required
            />
            {tab === "signup" && <span className="text-[13px] text-ink-soft">At least 8 characters.</span>}
          </label>

          {tab === "signup" && guestCount > 0 && (
            <label className="flex items-start gap-2.5 text-sm font-medium">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-brand"
                checked={copyGuestTasks}
                onChange={(e) => setCopyGuestTasks(e.target.checked)}
              />
              Copy my {guestCount} {guestCount === 1 ? "task" : "tasks"} from this device to the new account
            </label>
          )}

          {error && (
            <p className="text-sm font-medium text-urgent" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="justify-center disabled:opacity-60" disabled={busy}>
            {busy ? "One moment…" : tab === "signin" ? "Sign in" : "Create account"}
          </Button>
          {slow && (
            <p className="-mt-2 text-center text-[13px] text-ink-soft" role="status">
              Waking up the server. The first sign in can take up to a minute.
            </p>
          )}
        </form>
      </div>

      <div className="my-5 flex items-center gap-3 text-[13px] font-semibold text-ink-soft">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        variant="ghost"
        className="justify-center border border-line bg-surface"
        onClick={continueAsGuest}
      >
        Continue as guest
      </Button>
      <p className="mt-2 text-center text-[13px] text-ink-soft">Your tasks stay on this device only.</p>
    </main>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className={cx(
        "h-[38px] flex-1 rounded-[7px] text-sm font-semibold text-ink-soft",
        "aria-pressed:bg-surface aria-pressed:text-ink aria-pressed:shadow-card",
      )}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** True once `busy` has lasted a few seconds: a free server may be waking up. */
function useSlow(busy: boolean) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [busy]);
  return slow;
}

function errorMessage(err: unknown) {
  if (!(err instanceof ApiError)) return "Something went wrong. Please try again.";
  const fieldMessages = Object.values(err.issues ?? {}).flat();
  return fieldMessages.length ? fieldMessages.join(" ") : err.message;
}
