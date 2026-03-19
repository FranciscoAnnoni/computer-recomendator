import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import Link from "next/link";

export default function Home() {
  return (
    <Container>
      <section className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-6 max-w-2xl">
          <h1 className="text-heading font-bold tracking-tight text-foreground leading-[1.1]">
            Computer Recomendator
          </h1>
          <p className="text-subhead font-medium text-muted-foreground leading-[1.3]">
            Find the perfect laptop for your needs
          </p>
          <Link href="/quiz" className="mt-4">
            <Button size="lg">Find My Laptop &rarr;</Button>
          </Link>
        </div>
      </section>
    </Container>
  );
}
