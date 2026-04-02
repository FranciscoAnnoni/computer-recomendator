import { Plus } from "lucide-react";

export function EmptySlot({ slotNumber, onAdd }: { slotNumber: number; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card hover:border-foreground/40 transition-colors aspect-[3/4] w-full cursor-pointer"
      aria-label={`Seleccionar PC ${slotNumber}`}
    >
      <Plus className="size-8 text-muted-foreground mb-2" />
      <span className="text-[13px] text-muted-foreground font-mono">
        Seleccionar PC {slotNumber}...
      </span>
    </button>
  );
}
