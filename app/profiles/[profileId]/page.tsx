export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/app/actions/profiles";
import { getAdventuresByProfile } from "@/app/actions/adventures";
import { getProfileStats } from "@/app/actions/stats";
import { AdventureCard } from "@/components/adventures/adventure-card";
import { CreateAdventureDialog } from "@/components/adventures/create-adventure-dialog";
import type { Adventure } from "@/types";

interface ProfilePageProps {
  params: Promise<{ profileId: string }>;
}

function groupAdventures(adventures: Adventure[]) {
  return {
    active: adventures.filter((a) => a.status === "active"),
    paused: adventures.filter((a) => a.status === "paused"),
    completed: adventures.filter((a) => a.status === "completed"),
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { profileId } = await params;

  const [profile, adventures, stats] = await Promise.all([
    getProfile(profileId),
    getAdventuresByProfile(profileId),
    getProfileStats(profileId),
  ]);

  if (!profile) {
    notFound();
  }

  const { active, paused, completed } = groupAdventures(adventures);

  const { totalGames, wins, losses, favoriteClass, maxLevel, totalXpGained } =
    stats;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Accueil
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            {profile.name}
          </h1>
        </header>

        {/* Statistics */}
        <section className="mb-10 grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalGames}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Parties</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{wins}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Victoires</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{losses}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Défaites</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{favoriteClass ?? "—"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Classe favorite
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{maxLevel}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Niveau max</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalXpGained}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              XP total gagné
            </p>
          </div>
        </section>

        {/* Adventures header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Aventures</h2>
          <CreateAdventureDialog profileId={profileId} />
        </div>

        {adventures.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">Aucune aventure en cours.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Lancez une nouvelle aventure pour commencer !
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {active.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  En cours
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {active.map((adventure) => (
                    <AdventureCard key={adventure.id} adventure={adventure} />
                  ))}
                </div>
              </div>
            )}

            {paused.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  En pause
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {paused.map((adventure) => (
                    <AdventureCard key={adventure.id} adventure={adventure} />
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Terminées
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {completed.map((adventure) => (
                    <AdventureCard key={adventure.id} adventure={adventure} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
