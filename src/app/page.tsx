import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center min-h-screen px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-2xl">
        <h1 className="text-heading font-bold tracking-tight text-foreground leading-[1.1]">
          Computer Recomendator
        </h1>
        <p className="text-subhead font-medium text-muted-foreground leading-[1.3]">
          Find the perfect laptop for your needs
        </p>
        <Button size="lg" className="mt-4">
          Find My Laptop
        </Button>
      </div>
    </main>
  );
}
