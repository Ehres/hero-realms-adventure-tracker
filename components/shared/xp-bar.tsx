"use client";

import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
} from "@/components/ui/progress";

interface XpBarProps {
  currentXp: number;
  level: number;
}

export function XpBar({ currentXp, level }: XpBarProps) {
  const clamped = Math.min(100, Math.max(0, currentXp));

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-muted-foreground">
          Niveau {level}
        </span>
        <span className="font-medium" style={{ color: "rgb(234 179 8)" }}>
          {currentXp} / 100 XP
        </span>
      </div>
      <Progress value={clamped}>
        <ProgressTrack className="h-3">
          <ProgressIndicator
            className="h-full transition-all"
            style={{ backgroundColor: "rgb(234 179 8)" }}
          />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
