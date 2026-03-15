"use client";

import { useState, useTransition } from "react";
import { applyLevelUp } from "@/app/actions/adventures";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MAX_ABILITY_RANK,
  MAX_HEALTH_UPGRADES,
  MAX_SKILL_RANK,
  HEALTH_UPGRADE_VALUES,
} from "@/lib/constants";
import type { LevelUpChoice } from "@/types";

export interface LevelUpChoiceProps {
  adventureId: string;
  currentAbilityRank: number;
  currentSkillRank: number;
  currentHealthUpgrades: number;
  onComplete: () => void;
}

type ChoiceOption = {
  value: LevelUpChoice;
  label: string;
  icon: string;
  description: string;
  detail: string;
  disabled: boolean;
  disabledReason: string | undefined;
};

export function LevelUpChoiceCard({
  adventureId,
  currentAbilityRank,
  currentSkillRank,
  currentHealthUpgrades,
  onComplete,
}: LevelUpChoiceProps) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<LevelUpChoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hpGain =
    currentHealthUpgrades < HEALTH_UPGRADE_VALUES.length
      ? HEALTH_UPGRADE_VALUES[currentHealthUpgrades]
      : 0;

  const choices: ChoiceOption[] = [
    {
      value: "ability",
      label: "Capacité",
      icon: "⭐",
      description: "Augmenter le rang de capacité",
      detail:
        currentAbilityRank >= MAX_ABILITY_RANK
          ? `Rang max (${MAX_ABILITY_RANK})`
          : `Rang ${currentAbilityRank} → ${currentAbilityRank + 1}`,
      disabled: currentAbilityRank >= MAX_ABILITY_RANK,
      disabledReason:
        currentAbilityRank >= MAX_ABILITY_RANK
          ? "Rang maximum atteint"
          : undefined,
    },
    {
      value: "skill",
      label: "Compétence",
      icon: "🗡️",
      description: "Augmenter le rang de compétence",
      detail:
        currentSkillRank >= MAX_SKILL_RANK
          ? `Rang max (${MAX_SKILL_RANK})`
          : `Rang ${currentSkillRank} → ${currentSkillRank + 1}`,
      disabled: currentSkillRank >= MAX_SKILL_RANK,
      disabledReason:
        currentSkillRank >= MAX_SKILL_RANK
          ? "Rang maximum atteint"
          : undefined,
    },
    {
      value: "health",
      label: "Santé",
      icon: "❤️",
      description: "Augmenter les points de vie",
      detail:
        currentHealthUpgrades >= MAX_HEALTH_UPGRADES
          ? "Améliorations max"
          : `+${hpGain} PV maximum`,
      disabled: currentHealthUpgrades >= MAX_HEALTH_UPGRADES,
      disabledReason:
        currentHealthUpgrades >= MAX_HEALTH_UPGRADES
          ? "Améliorations maximales atteintes"
          : undefined,
    },
  ];

  function handleConfirm() {
    if (!selected) return;
    setError(null);

    startTransition(async () => {
      try {
        await applyLevelUp(adventureId, selected);
        onComplete();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {choices.map((choice) => {
          const isSelected = selected === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              disabled={choice.disabled || isPending}
              onClick={() => !choice.disabled && setSelected(choice.value)}
              className={[
                "relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all",
                choice.disabled
                  ? "cursor-not-allowed opacity-40 border-border bg-card"
                  : isSelected
                    ? "border-yellow-400 bg-yellow-400/10 ring-1 ring-yellow-400/50"
                    : "border-border bg-card hover:border-border/60 cursor-pointer",
              ].join(" ")}
            >
              <span className="text-2xl">{choice.icon}</span>
              <div>
                <p className="text-sm font-semibold">{choice.label}</p>
                <p className="text-xs text-muted-foreground">
                  {choice.description}
                </p>
              </div>
              <p
                className={`text-xs font-medium ${
                  choice.disabled
                    ? "text-muted-foreground"
                    : isSelected
                      ? "text-yellow-400"
                      : "text-foreground"
                }`}
              >
                {choice.disabled ? choice.disabledReason : choice.detail}
              </p>
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs text-black font-bold">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        onClick={handleConfirm}
        disabled={!selected || isPending}
        className="w-full"
        size="lg"
      >
        {isPending ? "Application..." : "Confirmer le choix"}
      </Button>
    </div>
  );
}
