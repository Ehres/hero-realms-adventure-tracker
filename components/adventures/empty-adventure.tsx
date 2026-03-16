"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateAdventureDialog } from "@/components/adventures/create-adventure-dialog";

interface EmptyAdventureProps {
  profileId: string;
}

export function EmptyAdventure({ profileId }: EmptyAdventureProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">Aucune aventure en cours.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Lancez une nouvelle aventure pour commencer !
        </p>
        <Button
          variant="frame"
          className="mt-6"
          onClick={() => setDialogOpen(true)}
        >
          Nouvelle aventure
        </Button>
      </div>
      <CreateAdventureDialog
        profileId={profileId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
