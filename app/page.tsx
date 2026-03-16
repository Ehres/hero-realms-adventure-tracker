export const dynamic = 'force-dynamic';

import { getProfiles } from "@/app/actions/profiles";
import { hasPendingLevelUps } from "@/app/actions/adventures";
import { ProfileList } from "@/components/profiles/profile-list";
import { NewGameButton } from "@/components/shared/new-game-button";

export default async function Home() {
  const [profiles, pendingLevelUp] = await Promise.all([
    getProfiles(),
    hasPendingLevelUps(),
  ]);

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
          <NewGameButton disabled={pendingLevelUp} />
        </header>

        <ProfileList profiles={profiles} />
      </div>
    </div>
  );
}
