"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "@/app/actions/games";
import { createAdventure } from "@/app/actions/adventures";
import type { Adventure, Profile } from "@/types";
import type { HeroClass } from "@/types";
import { Button } from "@/components/ui/warcraftcn/button";
import { Checkbox } from "@/components/ui/warcraftcn/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/warcraftcn/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/warcraftcn/radio-group";
import { HeroClassBadge } from "@/components/adventures/hero-class-badge";

const HERO_CLASSES: HeroClass[] = [
  "archer",
  "clerc",
  "guerrier",
  "sorcier",
  "voleur",
];

const CLASS_LABELS: Record<HeroClass, string> = {
  archer: "Archer",
  clerc: "Clerc",
  guerrier: "Guerrier",
  sorcier: "Sorcier",
  voleur: "Voleur",
};

interface GameSetupWizardProps {
  profiles: Array<{ id: string; name: string }>;
  adventures: Adventure[];
}

type AdventureSelection =
  | { type: "existing"; adventureId: string }
  | { type: "new"; heroClass: HeroClass | null };

export function GameSetupWizard({ profiles, adventures }: GameSetupWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProfileIds, setSelectedProfileIds] = useState<Set<string>>(
    new Set()
  );
  const [adventureSelections, setAdventureSelections] = useState<
    Record<string, AdventureSelection>
  >({});
  const [error, setError] = useState<string | null>(null);

  function toggleProfile(profileId: string) {
    setSelectedProfileIds((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  }

  function getAdventuresForProfile(profileId: string): Adventure[] {
    return adventures.filter((a) => a.profileId === profileId);
  }

  function setAdventureSelection(
    profileId: string,
    selection: AdventureSelection
  ) {
    setAdventureSelections((prev) => ({ ...prev, [profileId]: selection }));
  }

  function validateStep1(): boolean {
    return selectedProfileIds.size >= 2;
  }

  function goToStep2() {
    if (!validateStep1()) return;
    setError(null);

    // Pre-populate selections: default to existing active adventure if available
    const initialSelections: Record<string, AdventureSelection> = {};
    for (const profileId of selectedProfileIds) {
      const profileAdventures = getAdventuresForProfile(profileId);
      const firstAdventure = profileAdventures[0];
      if (firstAdventure) {
        initialSelections[profileId] = {
          type: "existing",
          adventureId: firstAdventure.id,
        };
      } else {
        initialSelections[profileId] = { type: "new", heroClass: null };
      }
    }
    setAdventureSelections(initialSelections);
    setStep(2);
  }

  function validateStep2(): string | null {
    for (const profileId of selectedProfileIds) {
      const selection = adventureSelections[profileId];
      if (!selection) return "Veuillez sélectionner une aventure pour chaque joueur.";

      if (selection.type === "existing") {
        const adventure = adventures.find(
          (a) => a.id === selection.adventureId
        );
        if (!adventure) return "Aventure introuvable.";
        if (adventure.pendingLevelUp) {
          const profile = profiles.find((p) => p.id === profileId);
          return `L'aventure de ${profile?.name ?? profileId} a une montée de niveau en attente. Résolvez-la avant de lancer une partie.`;
        }
      } else {
        if (!selection.heroClass) {
          const profile = profiles.find((p) => p.id === profileId);
          return `Veuillez choisir une classe pour ${profile?.name ?? profileId}.`;
        }
      }
    }
    return null;
  }

  function handleSubmit() {
    const validationError = validateStep2();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const adventureIds: string[] = [];

        for (const profileId of selectedProfileIds) {
          const selection = adventureSelections[profileId];
          if (!selection) throw new Error("Missing selection");

          if (selection.type === "existing") {
            adventureIds.push(selection.adventureId);
          } else {
            if (!selection.heroClass)
              throw new Error("Missing hero class for new adventure");
            const newId = await createAdventure(profileId, selection.heroClass);
            adventureIds.push(newId);
          }
        }

        const gameId = await createGame(adventureIds);
        router.push(`/game/${gameId}/combat`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
      }
    });
  }

  const selectedProfiles = profiles.filter((p) =>
    selectedProfileIds.has(p.id)
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Nouvelle Partie</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Étape {step} sur 2 —{" "}
          {step === 1
            ? "Sélectionnez les joueurs"
            : "Configurez les aventures"}
        </p>
        <div className="mt-3 flex gap-2">
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sélectionnez au moins 2 joueurs.
          </p>
          <div className="grid gap-3">
            {profiles.map((profile) => {
              const isSelected = selectedProfileIds.has(profile.id);
              const adventureCount = getAdventuresForProfile(profile.id).length;
              return (
                <Card
                  key={profile.id}
                  onClick={() => toggleProfile(profile.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "hover:border-border/80"
                  }`}
                >
                  <CardContent className="flex items-center gap-3 py-2">
                    <Checkbox
                      id={`profile-${profile.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleProfile(profile.id)}
                    >
                      {profile.name}
                    </Checkbox>
                    {adventureCount > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {adventureCount} aventure(s)
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {profiles.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Aucun profil trouvé. Créez des profils avant de lancer une partie.
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={goToStep2}
              disabled={selectedProfileIds.size < 2}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          {selectedProfiles.map((profile) => {
            const profileAdventures = getAdventuresForProfile(profile.id);
            const selection = adventureSelections[profile.id];

            return (
              <Card key={profile.id}>
                <CardHeader>
                  <CardTitle>{profile.name}</CardTitle>
                  <CardDescription>
                    Choisissez ou créez une aventure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={selection?.type === "existing" ? selection.adventureId : "new"}
                    onValueChange={(val) => {
                      if (val === "new") {
                        setAdventureSelection(profile.id, { type: "new", heroClass: null });
                      } else {
                        setAdventureSelection(profile.id, { type: "existing", adventureId: val });
                      }
                    }}
                  >
                    {profileAdventures.map((adv) => (
                      <div key={adv.id} className="flex items-center gap-3">
                        <RadioGroupItem value={adv.id} id={`adv-${adv.id}`} />
                        <label
                          htmlFor={`adv-${adv.id}`}
                          className="fantasy flex items-center gap-2 cursor-pointer"
                        >
                          <HeroClassBadge
                            heroClass={adv.heroClass as HeroClass}
                            size="sm"
                          />
                          <span className="text-sm">
                            Niv. {adv.level} — {adv.battleCount} combats
                          </span>
                          {adv.pendingLevelUp && (
                            <span className="text-xs font-medium text-yellow-400">
                              Niveau en attente
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="new" id={`new-${profile.id}`} />
                      <label
                        htmlFor={`new-${profile.id}`}
                        className="fantasy cursor-pointer text-muted-foreground"
                      >
                        + Nouvelle aventure
                      </label>
                    </div>
                  </RadioGroup>

                  {selection?.type === "new" && (
                    <RadioGroup
                      orientation="horizontal"
                      value={selection.heroClass ?? ""}
                      onValueChange={(val) =>
                        setAdventureSelection(profile.id, {
                          type: "new",
                          heroClass: val as HeroClass,
                        })
                      }
                      className="pl-7 flex-wrap"
                    >
                      {HERO_CLASSES.map((cls) => (
                        <div key={cls} className="flex flex-col items-center gap-1">
                          <RadioGroupItem
                            value={cls}
                            id={`cls-${profile.id}-${cls}`}
                          />
                          <label
                            htmlFor={`cls-${profile.id}-${cls}`}
                            className="fantasy text-xs cursor-pointer"
                          >
                            {CLASS_LABELS[cls]}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button
              variant="frame"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
              disabled={isPending}
            >
              Retour
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Création..." : "Lancer la partie"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
