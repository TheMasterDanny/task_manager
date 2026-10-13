import { create } from "zustand";

type CardTones = "lilac" | "sky" | "peach" | "mint";

type CardTitles = "To do" | "In progress" | "Review" | "Done";

type CardIds = "todo" | "doing" | "review" | "done";

type Priorities = "High" | "Medium" | "Low";

interface ColumnsState {
  columns: {
    id: CardIds;
    title: CardTitles;
    tone: CardTones;
  }[];
}

interface PriorityState {
  priorities: {
    high: Priorities;
    medium: Priorities;
    low: Priorities;
  }[];
}

export const useConfigStore = create<ColumnsState & PriorityState>(() => ({
    columns: [
        { id: "todo", title: "To do", tone: "lilac" },
        { id: "doing", title: "In progress", tone: "sky" },
        { id: "review", title: "Review", tone: "peach" },
        { id: "done", title: "Done", tone: "mint" },
    ],
    priorities: [
        { high: "High", medium: "Medium", low: "Low" },
    ],
}));