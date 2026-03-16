"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/warcraftcn/card";
import { Button } from "@/components/ui/warcraftcn/button";

interface HeroProfileCardProps {
  name: string;
  subtitle?: string | undefined;
  avatarUrl?: string | null | undefined;
  selected?: boolean | undefined;
  selectable?: boolean | undefined;
  onSelect?: (() => void) | undefined;
  className?: string | undefined;
}

export function HeroProfileCard({
  name,
  subtitle,
  avatarUrl,
  selected = false,
  selectable = false,
  onSelect,
  className,
}: HeroProfileCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center text-center w-48",
        selected && "ring-2 ring-[hsl(45_100%_50%)] ring-offset-2 ring-offset-background",
        className
      )}
    >
      <CardContent className="flex flex-col items-center gap-3 pt-6">
        <div className="wc-avatar-default wc-avatar-frame relative size-20 rounded-full overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="object-cover rounded-full scale-75"
            />
          ) : (
            <User className="size-8 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="fantasy text-base font-medium text-[hsl(45_100%_50%)]">
            {name}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>

      {selectable && (
        <CardFooter className="w-full justify-center">
          <Button
            variant="frame"
            onClick={onSelect}
            className={cn(
              "w-full text-sm",
              selected && "brightness-125"
            )}
          >
            {selected ? "Sélectionné" : "Select Hero"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
