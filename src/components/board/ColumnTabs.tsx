import { cx, TONE_CLASS } from "../../lib/styles";
import type { CardIds, Column } from "../../store/useConfigStore";

interface ColumnTabsProps {
  columns: Column[];
  active: CardIds;
  counts: Record<string, number>;
  onSelect: (id: CardIds) => void;
}

/** Column switcher: only visible on phones. */
export function ColumnTabs({ columns, active, counts, onSelect }: ColumnTabsProps) {
  return (
    <nav
      className="-mx-4 mb-3.5 flex gap-2 overflow-x-auto px-4 pt-0.5 pb-1 [scrollbar-width:none] tablet:hidden"
      aria-label="Columns"
    >
      {columns.map((col) => (
        <button
          key={col.id}
          className={cx(
            "group inline-flex h-10 flex-none items-center gap-2 rounded-full bg-surface pr-2 pl-3.5 text-sm font-semibold whitespace-nowrap text-ink-soft",
            "aria-pressed:bg-tone aria-pressed:text-tone-ink",
            TONE_CLASS[col.tone],
          )}
          aria-pressed={active === col.id}
          onClick={() => onSelect(col.id)}
        >
          {col.title}
          <span className="grid h-[26px] min-w-[26px] place-items-center rounded-full bg-tone px-1.5 font-display text-sm leading-none font-extrabold text-tone-ink group-aria-pressed:bg-surface">
            {counts[col.id]}
          </span>
        </button>
      ))}
    </nav>
  );
}
