"use client";

import Link from "next/link";
import { useState } from "react";
import { WcButton } from "@/components/ui/wc-button";

interface NewGameButtonProps {
  disabled: boolean;
}

export function NewGameButton({ disabled }: NewGameButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (disabled) {
    return (
      <div className="relative">
        <WcButton
          disabled
          aria-disabled="true"
          aria-label="Nouvelle Partie — Un héros attend son amélioration de niveau"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
        >
          Nouvelle Partie
        </WcButton>
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
    <WcButton asChild>
      <Link href="/game/new">Nouvelle Partie</Link>
    </WcButton>
  );
}
