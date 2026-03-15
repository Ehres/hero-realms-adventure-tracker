"use client";

import {
  useGameStore,
  type Participant,
} from "@/stores/game-store";

export function useActiveGame() {
  const participants = useGameStore((state) => state.participants);
  const gameId = useGameStore((state) => state.gameId);
  const setHp = useGameStore((state) => state.setHp);
  const initParticipants = useGameStore((state) => state.initParticipants);
  const reset = useGameStore((state) => state.reset);

  return {
    participants,
    gameId,
    adjustHp: (adventureId: string, delta: number) =>
      setHp(adventureId, delta),
    initGame: (gameId: string, participants: Participant[]) =>
      initParticipants(gameId, participants),
    reset,
  };
}
