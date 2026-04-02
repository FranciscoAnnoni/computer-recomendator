import { X } from "lucide-react";
import type { Laptop } from "@/types/laptop";
import { CompareSpecRow } from "./compare-spec-row";

export function CompareCard({ laptop, onRemove }: { laptop: Laptop; onRemove: () => void }) {
  return (
    <div className="relative rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      {/* X remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Quitar"
      >
        <X className="size-4 text-muted-foreground hover:text-foreground" />
      </button>

      {/* Image */}
      <div className="aspect-square w-full bg-muted overflow-hidden">
        <img
          src={laptop.image_url}
          alt={laptop.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* Model name header */}
      <div className="px-3 py-2.5 font-semibold text-[13px] text-foreground leading-snug">
        {laptop.name}
      </div>

      {/* Spec rows: GPU, CPU, RAM, Storage, Price */}
      <CompareSpecRow label="GPU" value={laptop.gpu} />
      <CompareSpecRow label="CPU" value={laptop.cpu} />
      <CompareSpecRow label="RAM" value={laptop.ram} />
      <CompareSpecRow label="Alma" value={laptop.storage} />
      <CompareSpecRow label="Precio" value={`$${laptop.price.toLocaleString()} USD`} />
    </div>
  );
}
