export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import { getGameWithParticipants } from "@/app/actions/game-queries";
import { HpTracker } from "@/components/game/hp-tracker";
import type { HeroClass } from "@/types";

interface CombatPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function CombatPage({ params }: CombatPageProps) {
  const { gameId } = await params;
  const data = await getGameWithParticipants(gameId);

  if (!data) {
    notFound();
  }

  const initialParticipants = data.participants.map((p) => ({
    adventureId: p.adventureId,
    participantId: p.id,
    currentHp: p.currentHp,
    maxHp: p.adventure.maxHp,
    profileName: p.profile.name,
    heroClass: p.adventure.heroClass as HeroClass,
  }));

  return (
    <HpTracker gameId={gameId} initialParticipants={initialParticipants} />
  );
}
