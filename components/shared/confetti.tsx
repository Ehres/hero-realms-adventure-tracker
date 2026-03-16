"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

const DEFAULT_COLORS = ["#FFD700", "#FFA500", "#FF8C00"];

export function useConfetti() {
  const fireLevelUp = useCallback(() => {
    const delays = [0, 150, 300];
    delays.forEach((delay) => {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.3 },
          colors: DEFAULT_COLORS,
          startVelocity: 45,
        });
      }, delay);
    });
  }, []);

  const fireLoot = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.5, y: 0.3 },
      colors: ["#FFD700", "#FFA500", "#C0C0C0"],
      startVelocity: 35,
    });
  }, []);

  return { fireLevelUp, fireLoot };
}

export function ConfettiOnMount({ colors }: { colors?: string[] }) {
  useEffect(() => {
    const burst = (delay: number) => {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.3 },
          colors: colors ?? DEFAULT_COLORS,
          startVelocity: 45,
        });
      }, delay);
    };

    burst(0);
    burst(150);
    burst(300);
  }, [colors]);

  return null;
}
