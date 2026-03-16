"use client";

export const dynamic = 'force-dynamic';

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { getGameWithParticipants } from "@/app/actions/game-queries";
import { HeroClassBadge } from "@/components/adventures/hero-class-badge";
import { LevelUpChoiceCard } from "@/components/game/levelup-choice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { HeroClass } from "@/types";
import { ConfettiOnMount } from "@/components/shared/confetti";

interface LevelUpPageProps {
  params: Promise<{ gameId: string }>;
}

function LevelUpContent({ gameId }: { gameId: string }) {
  const router = useRouter();

  const gameDataPromise = useState<ReturnType<typeof getGameWithParticipants>>(
    () => getGameWithParticipants(gameId)
  )[0];

  const data = use(gameDataPromise);

  const pendingParticipants = (data?.participants ?? []).filter(
    (p) => p.adventure.pendingLevelUp
  );

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  function handleComplete(adventureId: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(adventureId);

      // If all pending participants are done, redirect home
      if (next.size >= pendingParticipants.length) {
        router.push("/");
      }

      return next;
    });
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Partie introuvable.</p>
      </div>
    );
  }

  if (pendingParticipants.length === 0) {
    router.push("/");
    return null;
  }

  const remaining = pendingParticipants.filter(
    (p) => !completedIds.has(p.adventureId)
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ConfettiOnMount colors={["#FFD700", "#FFA500", "#FF6B35", "#FFFFFF"]} />
      <div className="mb-8 text-center">
        <p className="text-4xl mb-2">🎉</p>
        <h1 className="text-2xl font-bold tracking-tight">
          Montée de niveau !
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingParticipants.length > 1
            ? `${pendingParticipants.length} héros ont progressé`
            : "Un héros a progressé"}
        </p>
      </div>

      <div className="space-y-6">
        {pendingParticipants.map((p) => {
          const isDone = completedIds.has(p.adventureId);
          return (
            <Card
              key={p.adventureId}
              className={isDone ? "opacity-60" : undefined}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HeroClassBadge
                    heroClass={p.adventure.heroClass as HeroClass}
                    size="lg"
                  />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {p.profile.name}
                      {isDone && (
                        <span className="text-xs font-normal text-green-400">
                          ✓ Terminé
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Niveau {p.adventure.level} atteint !
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isDone ? (
                  <p className="text-sm text-muted-foreground">
                    Amélioration appliquée.
                  </p>
                ) : (
                  <LevelUpChoiceCard
                    adventureId={p.adventureId}
                    currentAbilityRank={p.adventure.abilityRank}
                    currentSkillRank={p.adventure.skillRank}
                    currentHealthUpgrades={p.adventure.healthUpgrades}
                    onComplete={() => handleComplete(p.adventureId)}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}

        {remaining.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-green-400 font-medium">
              Toutes les améliorations ont été appliquées !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LevelUpPage({ params }: LevelUpPageProps) {
  const { gameId } = use(params);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LevelUpContent gameId={gameId} />
    </div>
  );
}
