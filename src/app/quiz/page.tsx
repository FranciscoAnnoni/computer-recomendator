import { Container } from "@/components/layout/container";
import { QuizShell } from "@/components/quiz/quiz-shell";

export const metadata = {
  title: "Quiz - Computer Recomendator",
  description: "Descubre tu laptop ideal en 3 pasos",
};

export default function QuizPage() {
  return (
    <Container className="py-16">
      <QuizShell />
    </Container>
  );
}
