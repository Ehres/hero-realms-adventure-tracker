"use client";

import Link from "next/link";
import { useState } from "react";

interface NewGameButtonProps {
  disabled: boolean;
}

export function NewGameButton({ disabled }: NewGameButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const baseClassName =
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground whitespace-nowrap transition-all";

  if (disabled) {
    return (
      <div className="relative">
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label="Nouvelle Partie — Un héros attend son amélioration de niveau"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className={`${baseClassName} cursor-not-allowed opacity-50`}
        >
          Nouvelle Partie
        </button>
        {showTooltip && (
          <div
            role="tooltip"
            className="absolute right-0 top-full z-50 mt-1.5 w-max max-w-xs rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
          >
            Un héros attend son amélioration de niveau
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href="/game/new" className={`${baseClassName} hover:opacity-90`}>
      Nouvelle Partie
    </Link>
  );
}
