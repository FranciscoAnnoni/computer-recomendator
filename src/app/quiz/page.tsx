import { Container } from "@/components/layout/container";
import { QuizShell } from "@/components/quiz/quiz-shell";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz - Computer Recomendator",
  description: "Descubre tu laptop ideal en 3 pasos",
  openGraph: {
    title: "Quiz - Computer Recomendator",
    description: "Descubre tu laptop ideal en 3 pasos",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function QuizPage() {
  return (
    <Container className="py-4 md:py-16">
      <QuizShell />
    </Container>
  );
}
