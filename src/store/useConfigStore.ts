import { create } from "zustand";

export type CardTones = "lilac" | "sky" | "peach" | "mint";

export type CardTitles = "To do" | "In progress" | "Review" | "Done";

export type CardIds = "todo" | "doing" | "review" | "done";

export type PriorityIds = "high" | "medium" | "low";

export type Priorities = "High" | "Medium" | "Low";

export interface Column {
  id: CardIds;
  title: CardTitles;
  tone: CardTones;
}

interface ColumnsState {
  columns: Column[];
}

interface PriorityState {
  priorities: Record<PriorityIds, Priorities>;
}

export const useConfigStore = create<ColumnsState & PriorityState>(() => ({
    columns: [
        { id: "todo", title: "To do", tone: "lilac" },
        { id: "doing", title: "In progress", tone: "sky" },
        { id: "review", title: "Review", tone: "peach" },
        { id: "done", title: "Done", tone: "mint" },
    ],
    priorities: { high: "High", medium: "Medium", low: "Low" },
}));
