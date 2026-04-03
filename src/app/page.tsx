import { Container } from "@/components/layout/container";
import { HeroSection } from "@/components/home/hero-section";

export default function Home() {
  return (
    <Container>
      <section className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-4rem)]">
        <HeroSection />
      </section>
    </Container>
  );
}
