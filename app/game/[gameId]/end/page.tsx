"use client";

export const dynamic = 'force-dynamic';

import { use, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { endGame } from "@/app/actions/games";
import { assignLoot } from "@/app/actions/loot";
import { getGameWithParticipants } from "@/app/actions/game-queries";
import { HeroClassBadge } from "@/components/adventures/hero-class-badge";
import { Button } from "@/components/ui/button";
import { WcButton } from "@/components/ui/wc-button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HeroClass } from "@/types";
import { useConfetti } from "@/components/shared/confetti";

interface EndGamePageProps {
  params: Promise<{ gameId: string }>;
}

type LootState = {
  pendingLoots: Array<{ adventureId: string; lootType: "minor" | "major" }>;
  currentIndex: number;
  lootName: string;
};

function EndGameContent({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lootState, setLootState] = useState<LootState | null>(null);
  const { fireLoot } = useConfetti();

  const gameDataPromise = useState<ReturnType<typeof getGameWithParticipants>>(
    () => getGameWithParticipants(gameId)
  )[0];

  const data = use(gameDataPromise);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Partie introuvable.</p>
      </div>
    );
  }

  const { participants } = data;

  function handleConfirm() {
    if (!selectedWinner) return;
    setError(null);

    startTransition(async () => {
      try {
        const result = await endGame(gameId, selectedWinner);

        if (result.pendingLevelUps.length > 0) {
          router.push(`/game/${gameId}/levelup`);
          return;
        }

        if (result.pendingLoots.length > 0) {
          setLootState({
            pendingLoots: result.pendingLoots,
            currentIndex: 0,
            lootName: "",
          });
          return;
        }

        router.push("/");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      }
    });
  }

  async function handleLootAssign() {
    if (!lootState) return;
    const current = lootState.pendingLoots[lootState.currentIndex];
    if (!current || !lootState.lootName.trim()) return;

    try {
      await assignLoot(current.adventureId, lootState.lootName.trim());
      const nextIndex = lootState.currentIndex + 1;
      if (nextIndex >= lootState.pendingLoots.length) {
        router.push("/");
      } else {
        setLootState({ ...lootState, currentIndex: nextIndex, lootName: "" });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'attribution du butin."
      );
    }
  }

  function handleLootSkip() {
    if (!lootState) return;
    const nextIndex = lootState.currentIndex + 1;
    if (nextIndex >= lootState.pendingLoots.length) {
      router.push("/");
    } else {
      setLootState({ ...lootState, currentIndex: nextIndex, lootName: "" });
    }
  }

  const currentLoot = lootState
    ? lootState.pendingLoots[lootState.currentIndex]
    : null;
  const currentLootParticipant = currentLoot
    ? participants.find((p) => p.adventureId === currentLoot.adventureId)
    : null;

  useEffect(() => {
    if (currentLoot) {
      fireLoot();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!currentLoot]);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Fin de partie</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sélectionnez le vainqueur de cette partie.
        </p>
      </div>

      <div className="space-y-3">
        {participants.map((p) => {
          const isWinner = selectedWinner === p.adventureId;
          return (
            <button
              key={p.adventureId}
              type="button"
              onClick={() => setSelectedWinner(p.adventureId)}
              disabled={isPending}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                isWinner
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-border/80"
              } disabled:opacity-60`}
            >
              <div
                className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
                  isWinner
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                }`}
              />
              <div className="flex flex-1 items-center gap-2">
                <HeroClassBadge
                  heroClass={p.adventure.heroClass as HeroClass}
                />
                <span className="font-medium">{p.profile.name}</span>
              </div>
              <span
                className={`text-sm font-semibold ${isWinner ? "text-primary" : "text-muted-foreground"}`}
              >
                {isWinner ? "+30 XP" : "+10 XP"}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(`/game/${gameId}/combat`)}
          disabled={isPending}
          className="flex-1"
        >
          Retour
        </Button>
        <WcButton
          onClick={handleConfirm}
          disabled={!selectedWinner || isPending}
          className="flex-1"
        >
          {isPending ? "Traitement..." : "Confirmer"}
        </WcButton>
      </div>

      {/* Loot assignment modal */}
      <Dialog open={!!currentLoot} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Butin obtenu !</DialogTitle>
          </DialogHeader>
          {currentLoot && currentLootParticipant && (
            <div className="space-y-4">
              <Card>
                <CardContent className="flex items-center gap-2 pt-4">
                  <HeroClassBadge
                    heroClass={
                      currentLootParticipant.adventure.heroClass as HeroClass
                    }
                  />
                  <span className="font-medium">
                    {currentLootParticipant.profile.name}
                  </span>
                  <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-xs capitalize">
                    {currentLoot.lootType === "major" ? "Majeur" : "Mineur"}
                  </span>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="loot-name">Nom de l&apos;objet</Label>
                <Input
                  id="loot-name"
                  placeholder="ex: Épée de flamme"
                  value={lootState?.lootName ?? ""}
                  onChange={(e) =>
                    lootState &&
                    setLootState({ ...lootState, lootName: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleLootSkip}
                  className="flex-1"
                >
                  Ignorer
                </Button>
                <Button
                  onClick={handleLootAssign}
                  disabled={!lootState?.lootName.trim()}
                  className="flex-1"
                >
                  Attribuer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EndGamePage({ params }: EndGamePageProps) {
  const { gameId } = use(params);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <EndGameContent gameId={gameId} />
    </div>
  );
}
