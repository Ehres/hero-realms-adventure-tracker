import { Badge } from "@/components/ui/badge";

export type HeroClass = "archer" | "clerc" | "guerrier" | "sorcier" | "voleur";

interface HeroClassBadgeProps {
  heroClass: HeroClass;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<HeroClassBadgeProps["size"]>, string> = {
  sm: "text-xs px-2 py-0.5 h-5",
  md: "text-sm px-2.5 py-0.5 h-6",
  lg: "text-base px-3 py-1 h-7",
};

const classLabels: Record<HeroClass, string> = {
  archer: "Archer",
  clerc: "Clerc",
  guerrier: "Guerrier",
  sorcier: "Sorcier",
  voleur: "Voleur",
};

export function HeroClassBadge({
  heroClass,
  size = "md",
}: HeroClassBadgeProps) {
  return (
    <Badge
      className={sizeClasses[size]}
      style={{
        backgroundColor: `rgb(var(--color-${heroClass}) / 0.2)`,
        color: `rgb(var(--color-${heroClass}))`,
        borderColor: `rgb(var(--color-${heroClass}) / 0.4)`,
        border: "1px solid",
      }}
    >
      {classLabels[heroClass]}
    </Badge>
  );
}
