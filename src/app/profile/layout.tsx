import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil | Computer Recomendator",
  description: "Tu perfil de uso y laptops recomendadas.",
  openGraph: {
    title: "Mi Perfil | Computer Recomendator",
    description: "Tu perfil de uso y laptops recomendadas.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Computer Recomendator — encuentra tu laptop ideal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Perfil | Computer Recomendator",
    description: "Tu perfil de uso y laptops recomendadas.",
    images: [{ url: "/og-image.png", alt: "Computer Recomendator — encuentra tu laptop ideal" }],
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
