"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/layout/container";
import { ProfileAvatar } from "@/components/quiz/profile-avatar";
import { ProfileSheet } from "@/components/quiz/profile-sheet";
import { PROFILE_STORAGE_KEY, QUIZ_STORAGE_KEY } from "@/types/quiz";
import { getProfileColor } from "@/lib/profile-color";

const navLinks = [
  { href: "/catalog", label: "Catalog" },
  { href: "/compare", label: "Compare" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [completedProfile, setCompletedProfile] = useState<{
    profile_name: string;
    profile_description: string;
    profile_image_url: string | null;
    workload: string;
    lifestyle: string;
    budget: string;
    os_preference: string;
  } | null>(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedProfile(parsed);
      } catch {
        // Corrupted data — ignore
      }
    }
  }, []);

  const handleRehacer = () => {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(QUIZ_STORAGE_KEY);
    setCompletedProfile(null);
    setProfileSheetOpen(false);
    router.push("/quiz");
  };

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* LEFT: profile avatar (post-quiz) + logo */}
          <div className="flex items-center gap-3">
            {completedProfile && (
              <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
                <SheetTrigger
                  render={
                    <button aria-label="Ver perfil" className="inline-flex items-center justify-center" />
                  }
                >
                  <ProfileAvatar
                    color={getProfileColor(completedProfile.workload, completedProfile.lifestyle, completedProfile.budget, completedProfile.os_preference)}
                    profileName={completedProfile.profile_name}
                  />
                </SheetTrigger>
                <SheetContent side="left">
                  <ProfileSheet
                    profileName={completedProfile.profile_name}
                    profileDescription={completedProfile.profile_description}
                    onRehacer={handleRehacer}
                  />
                </SheetContent>
              </Sheet>
            )}
            <Link
              href="/"
              className="font-semibold text-foreground hover:opacity-80 transition-opacity"
            >
              Computer Recomendator
            </Link>
          </div>

          {/* RIGHT: desktop nav links + theme toggle + CTA */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Button variant={completedProfile ? "outline" : "default"}>
              <Link href={completedProfile ? "/profile" : "/quiz"}>
                Find My Laptop &rarr;
              </Link>
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <button
                    aria-label="Open menu"
                    className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 px-6 pt-16">
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-body text-muted-foreground hover:text-foreground transition-colors py-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-4">
                    <Button variant={completedProfile ? "outline" : "default"} className="w-full">
                      <Link href={completedProfile ? "/profile" : "/quiz"} onClick={() => setMobileOpen(false)}>
                        Find My Laptop &rarr;
                      </Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </nav>
  );
}
