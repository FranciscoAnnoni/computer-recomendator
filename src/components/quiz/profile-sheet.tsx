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
  onRehacer: () => void;
}

export function ProfileSheet({ profileName, profileDescription, onRehacer }: ProfileSheetProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-subhead font-medium">{profileName}</SheetTitle>
        <SheetDescription>{profileDescription}</SheetDescription>
      </SheetHeader>
      <SheetFooter>
        <Button onClick={onRehacer} className="w-full">
          Rehacer quiz
        </Button>
      </SheetFooter>
    </>
  );
}
