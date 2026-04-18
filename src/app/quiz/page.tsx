import { Container } from "@/components/layout/container";
import { QuizShell } from "@/components/quiz/quiz-shell";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz - Computer Recomendator",
  description: "Descubre tu laptop ideal en 3 pasos",
  openGraph: {
    title: "Quiz - Computer Recomendator",
    description: "Descubre tu laptop ideal en 3 pasos",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Computer Recomendator — encuentra tu laptop ideal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiz - Computer Recomendator",
    description: "Descubre tu laptop ideal en 3 pasos",
    images: [{ url: "/og-image.png", alt: "Computer Recomendator — encuentra tu laptop ideal" }],
  },
};

export default function QuizPage() {
  return (
    <Container className="py-4 md:py-16">
      <QuizShell />
    </Container>
  );
}
