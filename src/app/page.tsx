import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Darth Vypr"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
          <Link href="/projects/new">
            <Button>New Project</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <p className="text-muted-foreground">
          Your projects will appear here. Create a new project to get started.
        </p>
      </main>
    </div>
  );
}
