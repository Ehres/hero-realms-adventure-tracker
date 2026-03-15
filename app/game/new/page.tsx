export const dynamic = 'force-dynamic';

import { getProfiles } from "@/app/actions/profiles";
import { getAdventuresForSetup } from "@/app/actions/game-queries";
import { GameSetupWizard } from "./_components/game-setup-wizard";

export default async function NewGamePage() {
  const [profiles, profilesWithAdventures] = await Promise.all([
    getProfiles(),
    getAdventuresForSetup(),
  ]);

  const allAdventures = profilesWithAdventures.flatMap(
    (pwa) => pwa.adventures
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GameSetupWizard profiles={profiles} adventures={allAdventures} />
    </div>
  );
}
