export const dynamic = "force-dynamic";

import Image from "next/image";
import { getProfilesWithAdventureCounts } from "@/app/actions/profiles";
import { hasPendingLevelUps } from "@/app/actions/adventures";
import { ProfileList } from "@/components/profiles/profile-list";
import { NewGameButton } from "@/components/shared/new-game-button";

export default async function Home() {
  const [profiles, pendingLevelUp] = await Promise.all([
    getProfilesWithAdventureCounts(),
    hasPendingLevelUps(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <Image
              src="/hero-realms-logo.png"
              alt="Hero Realms Campaign"
              width={200}
              height={80}
              priority
            />
          </div>
          <NewGameButton disabled={pendingLevelUp} />
        </header>

        <ProfileList profiles={profiles} />
      </div>
    </div>
  );
}
