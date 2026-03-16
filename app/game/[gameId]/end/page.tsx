import { notFound } from "next/navigation";
import { getGameWithParticipants } from "@/app/actions/game-queries";
import { EndGameContent } from "@/components/game/end-game-content";

interface EndGamePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function EndGamePage({ params }: EndGamePageProps) {
  const { gameId } = await params;
  const data = await getGameWithParticipants(gameId);

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EndGameContent gameId={gameId} participants={data.participants} />
    </div>
  );
}
