import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil | Computer Recomendator",
  description: "Tu perfil de uso y laptops recomendadas.",
  openGraph: {
    title: "Mi Perfil | Computer Recomendator",
    description: "Tu perfil de uso y laptops recomendadas.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
