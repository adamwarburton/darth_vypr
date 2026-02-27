import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Vypr
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-xl font-semibold">Create New Project</h2>
        <p className="text-muted-foreground">
          The multi-step survey builder will be implemented here.
        </p>
        <div className="mt-4">
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
