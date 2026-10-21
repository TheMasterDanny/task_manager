import { useState } from "react";
import { useConfigStore, type CardIds } from "../../store/useConfigStore";
import { useTaskStore, type Task } from "../../store/useTaskStore";
import { BoardColumn } from "./BoardColumn";
import { ColumnTabs } from "./ColumnTabs";

export interface DropTarget {
  status: CardIds;
  beforeId: string | null;
}

/** Drag-and-drop state shared by the columns and cards of the board. */
export interface DnD {
  dragId: string | null;
  dropTarget: DropTarget | null;
  start: (id: string) => void;
  end: () => void;
  over: (status: CardIds, beforeId?: string | null) => void;
  drop: () => void;
}

interface BoardProps {
  tasks: Task[];
  filtering: boolean;
  onAdd: (status: CardIds) => void;
  onEdit: (task: Task) => void;
}

export function Board({ tasks, filtering, onAdd, onEdit }: BoardProps) {
  const columns = useConfigStore((s) => s.columns);
  const moveTask = useTaskStore((s) => s.moveTask);
  const toggleDone = useTaskStore((s) => s.toggleDone);

  const [activeCol, setActiveCol] = useState<CardIds>("todo"); // phones show one column at a time
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const end = () => {
    setDragId(null);
    setDropTarget(null);
  };

  const dnd: DnD = {
    dragId,
    dropTarget,
    start: setDragId,
    end,
    over: (status, beforeId = null) => setDropTarget({ status, beforeId }),
    drop: () => {
      if (dragId && dropTarget) moveTask(dragId, dropTarget.status, dropTarget.beforeId);
      end();
    },
  };

  const byStatus = (status: CardIds) => tasks.filter((t) => t.status === status);

  return (
    <>
      <ColumnTabs
        columns={columns}
        active={activeCol}
        counts={Object.fromEntries(columns.map((c) => [c.id, byStatus(c.id).length]))}
        onSelect={setActiveCol}
      />
      <main className="grid grid-cols-1 items-start gap-[18px] tablet:grid-cols-2 desktop:grid-cols-[repeat(4,minmax(270px,1fr))]">
        {columns.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            active={activeCol === col.id}
            tasks={byStatus(col.id)}
            filtering={filtering}
            dnd={dnd}
            onAdd={() => onAdd(col.id)}
            onEdit={onEdit}
            onToggle={toggleDone}
          />
        ))}
      </main>
    </>
  );
}
