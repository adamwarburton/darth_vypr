"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  pulse?: boolean;
}

export function StatCard({ label, value, subtext, pulse }: StatCardProps) {
  return (
    <Card className="flex-1 min-w-[180px]">
      <CardContent className="pt-4 pb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          {pulse && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          )}
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
