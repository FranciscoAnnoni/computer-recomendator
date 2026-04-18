import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { HeroSection } from "@/components/home/hero-section";

export const metadata: Metadata = {
  title: "Computer Recomendator",
  description: "Encuentra la laptop perfecta para tus necesidades con recomendaciones de expertos.",
  openGraph: {
    title: "Computer Recomendator",
    description: "Encuentra la laptop perfecta para tus necesidades con recomendaciones de expertos.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Computer Recomendator — encuentra tu laptop ideal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Computer Recomendator",
    description:
      "Encuentra la laptop perfecta para tus necesidades con recomendaciones de expertos.",
    images: [{ url: "/og-image.png", alt: "Computer Recomendator — encuentra tu laptop ideal" }],
  },
};

export default function Home() {
  return (
    <Container>
      <section className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-4rem)]">
        <HeroSection />
      </section>
    </Container>
  );
}
