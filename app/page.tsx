export const dynamic = 'force-dynamic';

import Link from "next/link";
import { getProfiles } from "@/app/actions/profiles";
import { ProfileList } from "@/components/profiles/profile-list";

export default async function Home() {
  const profiles = await getProfiles();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Hero Realms Campaign
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Suivi de campagne
            </p>
          </div>
          <Link
            href="/game/new"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground whitespace-nowrap transition-all hover:opacity-90"
          >
            Nouvelle Partie
          </Link>
        </header>

        <ProfileList profiles={profiles} />
      </div>
    </div>
  );
}
