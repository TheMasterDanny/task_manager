import type { ReactNode } from "react";
import { useConfigStore, type PriorityIds } from "../store/useConfigStore";
import { BoardIcon, ListIcon, SearchIcon } from "./ui/icons";
import { Select } from "./ui/Select";

export type View = "board" | "list";
export type PriorityFilter = PriorityIds | "all";

interface ToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  priority: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  view: View;
  onViewChange: (view: View) => void;
}

export function Toolbar({ query, onQueryChange, priority, onPriorityChange, view, onViewChange }: ToolbarProps) {
  const priorities = useConfigStore((s) => s.priorities);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 tablet:mb-6">
      <label className="flex h-[42px] w-full items-center gap-2.5 rounded-ctl border border-line bg-surface px-3.5 text-ink-soft focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15 tablet:w-[min(340px,100%)]">
        <SearchIcon />
        <span className="sr-only">Search tasks</span>
        <input
          type="search"
          className="min-w-0 flex-1 bg-transparent text-ink outline-none"
          placeholder="Search tasks"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </label>

      <div className="flex w-full gap-2.5 tablet:w-auto">
        <label className="sr-only" htmlFor="priority-filter">Filter by priority</label>
        <Select
          id="priority-filter"
          wrapperClassName="flex-1 tablet:flex-none"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as PriorityFilter)}
        >
          <option value="all">All priorities</option>
          {Object.entries(priorities).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>

        <div className="flex rounded-ctl border border-line bg-surface p-[3px]" role="group" aria-label="View">
          <ViewButton active={view === "list"} label="List view" onClick={() => onViewChange("list")}>
            <ListIcon />
          </ViewButton>
          <ViewButton active={view === "board"} label="Board view" onClick={() => onViewChange("board")}>
            <BoardIcon />
          </ViewButton>
        </div>
      </div>
    </div>
  );
}

function ViewButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      className="grid h-[34px] w-9 place-items-center rounded-[7px] text-ink-soft aria-pressed:bg-ink aria-pressed:text-white"
      aria-pressed={active}
      onClick={onClick}
      title={label}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
