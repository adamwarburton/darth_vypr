import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Vypr</h1>
          <Link href="/projects/new">
            <Button>New Project</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">
          Your projects will appear here. Create a new project to get started.
        </p>
      </main>
    </div>
  );
}
