"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdventure } from "@/app/actions/adventures";
import { MAX_HP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { WcButton } from "@/components/ui/wc-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { HeroClass } from "@/types";

interface CreateAdventureDialogProps {
  profileId: string;
}

const heroClasses: Array<{
  id: HeroClass;
  label: string;
  color: string;
  description: string;
}> = [
  {
    id: "guerrier",
    label: "Guerrier",
    color: "rgb(239, 68, 68)",
    description: `${MAX_HP.guerrier} PV`,
  },
  {
    id: "clerc",
    label: "Clerc",
    color: "rgb(253, 224, 71)",
    description: `${MAX_HP.clerc} PV`,
  },
  {
    id: "archer",
    label: "Archer",
    color: "rgb(134, 239, 172)",
    description: `${MAX_HP.archer} PV`,
  },
  {
    id: "sorcier",
    label: "Sorcier",
    color: "rgb(96, 165, 250)",
    description: `${MAX_HP.sorcier} PV`,
  },
  {
    id: "voleur",
    label: "Voleur",
    color: "rgb(107, 114, 128)",
    description: `${MAX_HP.voleur} PV`,
  },
];

export function CreateAdventureDialog({ profileId }: CreateAdventureDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<HeroClass | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!isPending) {
      setOpen(next);
      if (!next) {
        setSelected(null);
        setError(null);
      }
    }
  }

  function handleCreate() {
    if (!selected) {
      setError("Choisissez une classe de héros.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const adventureId = await createAdventure(profileId, selected);
        setOpen(false);
        router.push(`/adventures/${adventureId}`);
      } catch {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Nouvelle aventure
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisissez votre classe</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 py-2">
          {heroClasses.map((cls) => {
            const isSelected = selected === cls.id;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelected(cls.id)}
                disabled={isPending}
                className={[
                  "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all",
                  isSelected
                    ? "ring-2"
                    : "border-border hover:border-foreground/30",
                  isPending ? "opacity-50 pointer-events-none" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  isSelected
                    ? {
                        borderColor: cls.color,
                        backgroundColor: `${cls.color}10`,
                      }
                    : undefined
                }
              >
                <span
                  className="font-medium"
                  style={{ color: isSelected ? cls.color : undefined }}
                >
                  {cls.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {cls.description}
                </span>
              </button>
            );
          })}
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <WcButton
            type="button"
            onClick={handleCreate}
            disabled={isPending || selected === null}
          >
            {isPending ? "Création…" : "Commencer l'aventure"}
          </WcButton>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  );
}
