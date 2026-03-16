"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pauseAdventure, resumeAdventure } from "@/app/actions/adventures";
import { HeroClassBadge } from "@/components/adventures/hero-class-badge";
import { XpBar } from "@/components/shared/xp-bar";
import { StarRank } from "@/components/shared/star-rank";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { Adventure, HeroClass } from "@/types";

interface AdventureCardProps {
  adventure: Adventure;
}

const statusLabels: Record<string, string> = {
  active: "En cours",
  paused: "En pause",
  completed: "Terminée",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  paused: "secondary",
  completed: "outline",
};

export function AdventureCard({ adventure }: AdventureCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const heroClass = adventure.heroClass as HeroClass;
  const status = adventure.status;

  function handleTogglePause() {
    setError(null);
    startTransition(async () => {
      try {
        if (status === "active") {
          await pauseAdventure(adventure.id);
        } else if (status === "paused") {
          await resumeAdventure(adventure.id);
        }
        router.refresh();
      } catch {
        setError("Une erreur est survenue.");
      }
    });
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <HeroClassBadge heroClass={heroClass} size="md" />
          </CardTitle>
          <Badge variant={statusVariants[status] ?? "outline"}>
            {statusLabels[status] ?? status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <XpBar currentXp={adventure.xp} level={adventure.level} />

        <div className="flex flex-col gap-1.5">
          <StarRank
            current={adventure.abilityRank}
            max={5}
            label="Capacités"
          />
          <StarRank
            current={adventure.skillRank}
            max={3}
            label="Compétences"
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {adventure.battleCount} combat{adventure.battleCount !== 1 ? "s" : ""}
        </p>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        {status !== "completed" && (
          <Button
            variant="frame"
            onClick={handleTogglePause}
            disabled={isPending}
          >
            {isPending
              ? "…"
              : status === "active"
              ? "Mettre en pause"
              : "Reprendre"}
          </Button>
        )}
        <Link
          href={`/adventures/${adventure.id}`}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Voir →
        </Link>
      </CardFooter>
    </Card>
  );
}
