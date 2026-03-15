"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { pauseAdventure, resumeAdventure } from "@/app/actions/adventures";
import { Button } from "@/components/ui/button";

interface AdventureControlsProps {
  adventureId: string;
  status: string;
}

export function AdventureControls({
  adventureId,
  status,
}: AdventureControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleTogglePause() {
    setError(null);
    startTransition(async () => {
      try {
        if (status === "active") {
          await pauseAdventure(adventureId);
        } else if (status === "paused") {
          await resumeAdventure(adventureId);
        }
        router.refresh();
      } catch {
        setError("Une erreur est survenue.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={handleTogglePause}
        disabled={isPending}
        className="w-full"
      >
        {isPending
          ? "…"
          : status === "active"
          ? "Mettre en pause"
          : "Reprendre l'aventure"}
      </Button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}
