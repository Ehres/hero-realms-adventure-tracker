"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { updateHp } from "@/app/actions/games";
import { useActiveGame } from "@/hooks/use-active-game";
import { HeroClassBadge } from "@/components/adventures/hero-class-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HeroClass } from "@/types";

export interface HpTrackerParticipant {
  adventureId: string;
  participantId: string;
  currentHp: number;
  maxHp: number;
  profileName: string;
  heroClass: HeroClass;
}

interface HpTrackerProps {
  gameId: string;
  initialParticipants: HpTrackerParticipant[];
}

const HP_DELTAS = [-5, -1, 1, 5] as const;

export function HpTracker({ gameId, initialParticipants }: HpTrackerProps) {
  const { participants, initGame, adjustHp } = useActiveGame();
  const [, startTransition] = useTransition();

  useEffect(() => {
    initGame(
      gameId,
      initialParticipants.map((p) => ({
        adventureId: p.adventureId,
        currentHp: p.currentHp,
        maxHp: p.maxHp,
        profileName: p.profileName,
        heroClass: p.heroClass,
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Build a map from adventureId to participantId for the server action
  const participantIdMap = Object.fromEntries(
    initialParticipants.map((p) => [p.adventureId, p.participantId])
  );

  function handleHpChange(adventureId: string, currentHp: number, delta: number) {
    const newHp = Math.max(0, currentHp + delta);
    adjustHp(adventureId, delta);

    const participantId = participantIdMap[adventureId];
    if (!participantId) return;

    startTransition(async () => {
      await updateHp(participantId, newHp);
    });
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-background text-foreground">
      <header className="shrink-0 border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">Combat en cours</h1>
        <p className="text-xs text-muted-foreground">
          {participants.length} joueur{participants.length > 1 ? "s" : ""}
        </p>
      </header>

      <main className="flex-1 overflow-hidden p-3">
        <div className="h-full grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {participants.map((participant) => {
            const hpPercent =
              participant.maxHp > 0
                ? participant.currentHp / participant.maxHp
                : 0;
            const isOverhealed = participant.currentHp > participant.maxHp;
            const isCritical = hpPercent < 0.2 && participant.currentHp > 0;
            const isDead = participant.currentHp === 0;

            let hpColorClass = "text-foreground";
            if (isDead) hpColorClass = "text-destructive";
            else if (isOverhealed) hpColorClass = "text-yellow-400";
            else if (isCritical) hpColorClass = "text-red-500 animate-pulse";

            return (
              <Card key={participant.adventureId} className="h-full flex flex-col">
                <CardContent className="flex-1 flex flex-col gap-3 pt-4">
                  <div className="flex items-center gap-2">
                    <HeroClassBadge heroClass={participant.heroClass} />
                    <span className="text-sm font-medium">
                      {participant.profileName}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <span
                      className={`font-mono text-7xl font-bold tabular-nums transition-colors ${hpColorClass}`}
                    >
                      {participant.currentHp}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {participant.maxHp} PV
                    </span>

                    {/* HP bar */}
                    <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isDead
                            ? "bg-destructive"
                            : isCritical
                              ? "bg-red-500"
                              : isOverhealed
                                ? "bg-yellow-400"
                                : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(100, hpPercent * 100).toFixed(1)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {HP_DELTAS.map((delta) => (
                      <Button
                        key={delta}
                        variant={delta < 0 ? "default" : "frame"}
                        onClick={() =>
                          handleHpChange(
                            participant.adventureId,
                            participant.currentHp,
                            delta
                          )
                        }
                        className={`min-h-[72px] w-full text-2xl font-bold font-mono${delta < 0 ? " brightness-75 hue-rotate-[-20deg]" : ""}`}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <footer className="shrink-0 border-t border-border px-4 py-3">
        <Link
          href={`/game/${gameId}/end`}
          className="flex h-14 w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 text-base font-medium transition-colors hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
        >
          Fin de partie
        </Link>
      </footer>
    </div>
  );
}
