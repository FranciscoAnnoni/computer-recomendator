"use client";

import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

interface ProfileSheetProps {
  profileName: string;
  profileDescription: string;
  onGoToProfile: () => void;
}

export function ProfileSheet({ profileName, profileDescription, onGoToProfile }: ProfileSheetProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-subhead font-medium">{profileName}</SheetTitle>
        <SheetDescription>{profileDescription}</SheetDescription>
      </SheetHeader>
      <SheetFooter>
        <Button onClick={onGoToProfile} className="w-full">
          Ir al perfil
        </Button>
      </SheetFooter>
    </>
  );
}
