import { Card, CardContent } from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";

interface ProfileStatsProps {
  totalGames: number;
  wins: number;
  losses: number;
  favoriteClass: string | null;
  maxLevel: number;
  totalXpGained: number;
}

export function ProfileStats({
  totalGames,
  wins,
  losses,
  favoriteClass,
  maxLevel,
  totalXpGained,
}: ProfileStatsProps) {
  return (
    <Card className="mb-10">
      <CardContent className="grid grid-cols-3 gap-4 py-4">
        <div className="text-center">
          <p className="fantasy text-2xl font-bold">{totalGames}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Parties</p>
        </div>
        <div className="text-center">
          <p className="fantasy text-2xl font-bold text-green-400">{wins}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Victoires</p>
        </div>
        <div className="text-center">
          <p className="fantasy text-2xl font-bold text-red-400">{losses}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Défaites</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          {favoriteClass ? (
            <Badge variant="secondary" size="default">
              {favoriteClass}
            </Badge>
          ) : (
            <p className="fantasy text-2xl font-bold">—</p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">Classe favorite</p>
        </div>
        <div className="text-center">
          <p className="fantasy text-2xl font-bold">{maxLevel}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Niveau max</p>
        </div>
        <div className="text-center">
          <p className="fantasy text-2xl font-bold">{totalXpGained}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">XP total gagné</p>
        </div>
      </CardContent>
    </Card>
  );
}
