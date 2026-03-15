import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
  return (
    <Link
      href={`/profiles/${profile.id}`}
      className="block transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="h-full cursor-pointer hover:ring-foreground/20 transition-all">
        <CardHeader>
          <CardTitle>{profile.name}</CardTitle>
          <CardDescription>
            {adventureCount === 0
              ? "Aucune aventure"
              : `${adventureCount} aventure${adventureCount > 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        {winCount !== undefined && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {winCount} victoire{winCount > 1 ? "s" : ""}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
