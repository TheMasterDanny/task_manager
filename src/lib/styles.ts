import type { CardTones, PriorityIds } from "../store/useConfigStore";

/** Joins class names, skipping falsy values. */
export const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

// Full class names (not built with template strings) so Tailwind can find them.
export const TONE_CLASS: Record<CardTones, string> = {
  lilac: "tone-lilac",
  sky: "tone-sky",
  peach: "tone-peach",
  mint: "tone-mint",
};

export const PRIORITY_CLASS: Record<PriorityIds, string> = {
  high: "bg-high-bg text-high-ink",
  medium: "bg-medium-bg text-medium-ink",
  low: "bg-low-bg text-low-ink",
};

export const chipClass = (priority: PriorityIds) =>
  cx(
    "inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[12.5px] font-semibold",
    PRIORITY_CLASS[priority],
  );

export const fieldControlClass =
  "w-full rounded-ctl border border-line bg-surface px-3 py-2.5 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/15";
