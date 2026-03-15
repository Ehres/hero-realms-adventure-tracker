import { create } from "zustand";

export type HeroClass =
  | "archer"
  | "clerc"
  | "guerrier"
  | "sorcier"
  | "voleur";

export type Participant = {
  adventureId: string;
  currentHp: number;
  maxHp: number;
  profileName: string;
  heroClass: HeroClass;
};

type GameStore = {
  participants: Participant[];
  gameId: string | null;
  initParticipants: (gameId: string, participants: Participant[]) => void;
  setHp: (adventureId: string, delta: number) => void;
  reset: () => void;
};

const initialState = {
  participants: [] as Participant[],
  gameId: null as string | null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  initParticipants: (gameId, participants) => {
    set({ gameId, participants });
  },

  setHp: (adventureId, delta) => {
    set((state) => ({
      participants: state.participants.map((p) => {
        if (p.adventureId !== adventureId) return p;
        const newHp = Math.max(0, Math.min(p.maxHp, p.currentHp + delta));
        return { ...p, currentHp: newHp };
      }),
    }));
  },

  reset: () => {
    set(initialState);
  },
}));
