export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdventure } from "@/app/actions/adventures";
import { HeroClassBadge } from "@/components/adventures/hero-class-badge";
import { XpBar } from "@/components/shared/xp-bar";
import { StarRank } from "@/components/shared/star-rank";
import { InventorySlots } from "@/components/shared/inventory-slots";
import { AdventureControls } from "@/components/adventures/adventure-controls";
import { Badge } from "@/components/ui/badge";
import type { HeroClass } from "@/types";

interface AdventurePageProps {
  params: Promise<{ adventureId: string }>;
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

export default async function AdventurePage({ params }: AdventurePageProps) {
  const { adventureId } = await params;

  const adventure = await getAdventure(adventureId);

  if (!adventure) {
    notFound();
  }

  const heroClass = adventure.heroClass as HeroClass;
  const status = adventure.status;

  const inventoryItems: (string | null)[] = adventure.inventory.map(
    (item) => item ?? null
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-8">
          <Link
            href={`/profiles/${adventure.profileId}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Profil
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <HeroClassBadge heroClass={heroClass} size="lg" />
            <Badge variant={statusVariants[status] ?? "outline"}>
              {statusLabels[status] ?? status}
            </Badge>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          {/* XP & Level */}
          <section className="rounded-xl border border-border bg-card p-4">
            <XpBar currentXp={adventure.xp} level={adventure.level} />
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">PV max</p>
              <p className="text-xl font-bold">{adventure.maxHp}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Combats</p>
              <p className="text-xl font-bold">{adventure.battleCount}</p>
            </div>
          </section>

          {/* Ranks */}
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Capacités</p>
              <StarRank current={adventure.abilityRank} max={5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Compétences</p>
              <StarRank current={adventure.skillRank} max={3} />
            </div>
          </section>

          {/* Inventory */}
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-medium">Inventaire</h2>
            <InventorySlots items={inventoryItems} maxSlots={4} />
          </section>

          {/* Pause / Resume controls */}
          {status !== "completed" && (
            <AdventureControls adventureId={adventure.id} status={status} />
          )}
        </div>
      </div>
    </div>
  );
}
