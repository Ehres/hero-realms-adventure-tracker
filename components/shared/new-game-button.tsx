"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface NewGameButtonProps {
  disabled: boolean;
}

export function NewGameButton({ disabled }: NewGameButtonProps) {
  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button
              disabled
              aria-disabled="true"
              aria-label="Nouvelle Partie — Un héros attend son amélioration de niveau"
            >
              Nouvelle Partie
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Un héros attend son amélioration de niveau
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button asChild>
      <Link href="/game/new">Nouvelle Partie</Link>
    </Button>
  );
}
