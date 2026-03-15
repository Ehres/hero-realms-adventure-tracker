"use client";

interface InventorySlotsProps {
  items: (string | null)[];
  onSwap?: (slotIndex: number) => void;
  maxSlots?: number;
}

export function InventorySlots({
  items,
  onSwap,
  maxSlots = 4,
}: InventorySlotsProps) {
  const slots = Array.from({ length: maxSlots }, (_, i) => items[i] ?? null);

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((item, index) => {
        const isEmpty = item === null;
        const isClickable = !isEmpty && onSwap !== undefined;

        return (
          <div
            key={index}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={isClickable ? () => onSwap(index) : undefined}
            onKeyDown={
              isClickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSwap(index);
                    }
                  }
                : undefined
            }
            className={[
              "flex items-center justify-center rounded-md px-2 py-3 text-sm min-h-[56px]",
              isEmpty
                ? "border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50"
                : "border border-border bg-card text-card-foreground font-medium",
              isClickable
                ? "cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {isEmpty ? "Vide" : item}
          </div>
        );
      })}
    </div>
  );
}
