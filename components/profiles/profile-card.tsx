import Link from "next/link";
import { HeroProfileCard } from "@/components/shared/hero-profile-card";
import type { Profile } from "@/types";

interface ProfileCardProps {
  profile: Profile;
  adventureCount: number;
  winCount?: number;
}

export function ProfileCard({
  profile,
  adventureCount,
  winCount,
}: ProfileCardProps) {
  const subtitle =
    adventureCount === 0
      ? "Aucune aventure"
      : winCount !== undefined
        ? `${adventureCount} aventure${adventureCount > 1 ? "s" : ""} · ${winCount} victoire${winCount > 1 ? "s" : ""}`
        : `${adventureCount} aventure${adventureCount > 1 ? "s" : ""}`;

  return (
    <Link
      href={`/profiles/${profile.id}`}
      className="block transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <HeroProfileCard
        name={profile.name}
        subtitle={subtitle}
        className="h-full w-full cursor-pointer"
      />
    </Link>
  );
}
