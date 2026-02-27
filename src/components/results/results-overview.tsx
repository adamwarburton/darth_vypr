"use client";

import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Activity,
} from "lucide-react";

const stats = [
  {
    label: "Total Responses",
    value: "1,247",
    change: "+127 today",
    trend: "up",
    icon: Users,
    accent: "text-vypr-teal",
    accentBg: "bg-vypr-teal/10",
  },
  {
    label: "Completion Rate",
    value: "78.4%",
    change: "+3.2% vs yesterday",
    trend: "up",
    icon: CheckCircle2,
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
  },
  {
    label: "Avg. Duration",
    value: "3m 24s",
    change: "12% faster",
    trend: "up",
    icon: Clock,
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
  },
  {
    label: "Response Rate",
    value: "64.2%",
    change: "+8.1% vs benchmark",
    trend: "up",
    icon: Activity,
    accent: "text-indigo-400",
    accentBg: "bg-indigo-500/10",
  },
];

export function ResultsOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#141933] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <ArrowUpRight className="size-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${stat.accentBg}`}
              >
                <Icon className={`size-5 ${stat.accent}`} />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-vypr-teal/20 to-transparent" />
          </div>
        );
      })}
    </div>
  );
}
