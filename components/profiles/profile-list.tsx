"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/profiles/profile-card";
import { CreateProfileDialog } from "@/components/profiles/create-profile-dialog";
import type { Profile } from "@/types";

interface ProfileListProps {
  profiles: Profile[];
}

export function ProfileList({ profiles }: ProfileListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Joueurs</h2>
        <Button variant="frame" onClick={() => setDialogOpen(true)}>
          Nouveau profil
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-muted-foreground">Aucun profil pour l&apos;instant.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez un profil pour commencer à suivre vos aventures.
          </p>
          <Button
            variant="frame"
            className="mt-6"
            onClick={() => setDialogOpen(true)}
          >
            Créer mon premier profil
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} adventureCount={0} />
          ))}
        </div>
      )}

      <CreateProfileDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
}
