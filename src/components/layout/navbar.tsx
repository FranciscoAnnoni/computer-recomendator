"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/layout/container";
import { ProfileAvatar } from "@/components/quiz/profile-avatar";
import { ProfileSheet } from "@/components/quiz/profile-sheet";
import { PROFILE_STORAGE_KEY } from "@/types/quiz";
import { getProfileColor } from "@/lib/profile-color";

const navLinks = [
  { href: "/catalog", label: "Catálogo" },
  { href: "/compare", label: "Comparar" },
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
        setCompletedProfile(JSON.parse(saved));
      } catch {
        // Corrupted data — ignore
      }
    }

    const handleProfileUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setCompletedProfile(detail);
    };
    window.addEventListener("profileUpdated", handleProfileUpdated);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdated);
  }, []);

  const handleGoToProfile = () => {
    setProfileSheetOpen(false);
    router.push("/profile");
  };

  return (
    <nav className="navbar-ed sticky top-0 z-50 border-b border-white/[0.04]">
      <Container>
        <div className="flex items-center h-[68px] gap-8">
          {/* Brand */}
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
                <SheetContent side="left" className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
                  <ProfileSheet
                    profileName={completedProfile.profile_name}
                    profileDescription={completedProfile.profile_description}
                    onGoToProfile={handleGoToProfile}
                  />
                </SheetContent>
              </Sheet>
            )}
            <Link
              href="/"
              style={{ fontFamily: 'var(--font-display-ed)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}
              className="hover:opacity-80 transition-opacity"
            >
              Computer <span style={{ color: 'var(--on-sur-muted)', fontWeight: 500 }}>Recomendator</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 ml-auto">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link-ed">
                {link.label}
              </Link>
            ))}
            <Link href={completedProfile ? "/profile" : "/quiz"}>
              <button className="btn-ed btn-ed-sm btn-primary-ed">
                {completedProfile ? "Ir al perfil →" : "Encontrá mi laptop →"}
              </button>
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <button
                    aria-label="Abrir menú"
                    className="icon-btn-ed"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
                <nav className="flex flex-col gap-2 px-5 pt-14">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="nav-link-ed py-2 block"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-4">
                    <Link href={completedProfile ? "/profile" : "/quiz"} onClick={() => setMobileOpen(false)}>
                      <button className="btn-ed btn-ed-md btn-primary-ed w-full">
                        {completedProfile ? "Ir al perfil →" : "Encontrá mi laptop →"}
                      </button>
                    </Link>
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
