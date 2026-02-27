"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<string>("");

  async function handleSeed() {
    setStatus("loading");
    setResult("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setResult(data.error || "Unknown error");
        return;
      }
      setStatus("success");
      setResult(
        `Seeded: ${data.seeded.project} project, ${data.seeded.questions} questions, ${data.seeded.responses} responses, ${data.seeded.answers} answers`
      );
    } catch (err) {
      setStatus("error");
      setResult(err instanceof Error ? err.message : "Network error");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Seed Demo Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will insert the &quot;Summer Range Taste Test 2025&quot; demo project with
            75 respondents and all 10 question types into the database. Existing demo
            data will be replaced.
          </p>
          <Button
            onClick={handleSeed}
            disabled={status === "loading"}
            className="w-full"
          >
            {status === "loading" ? "Seeding..." : "Seed Database"}
          </Button>
          {result && (
            <p
              className={`text-sm ${
                status === "error" ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {result}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
