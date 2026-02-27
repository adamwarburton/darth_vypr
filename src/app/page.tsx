import {
  Activity,
  Users,
  FileBarChart,
  TrendingUp,
  Zap,
  Clock,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { ProjectList } from "@/components/dashboard/project-list";

const stats = [
  {
    label: "Active Projects",
    value: "3",
    change: "+2 this month",
    icon: FileBarChart,
    color: "text-vypr-teal",
    bgColor: "bg-vypr-teal/10",
  },
  {
    label: "Total Responses",
    value: "4,813",
    change: "+847 this week",
    icon: Users,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  {
    label: "Avg. Completion",
    value: "78%",
    change: "+5% vs last month",
    icon: TrendingUp,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Avg. Response Time",
    value: "3m 24s",
    change: "12% faster",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-vypr-teal">
            <Activity className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Consumer Intelligence
            </span>
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Monitor your active studies and track consumer insight performance.
          </p>
        </div>

        {/* Stats grid */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                      <Zap className="size-3 text-vypr-teal" />
                      <span className="text-xs text-vypr-teal">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${stat.bgColor}`}
                  >
                    <Icon className={`size-5 ${stat.color}`} />
                  </div>
                </div>
                {/* Subtle gradient accent at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-vypr-teal/20 to-transparent" />
              </div>
            );
          })}
        </div>

        {/* Projects section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Projects
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              6 projects across all stages
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] p-1">
            <button className="rounded-md bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-foreground">
              All
            </button>
            <button className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              Live
            </button>
            <button className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              Draft
            </button>
            <button className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              Closed
            </button>
          </div>
        </div>

        <ProjectList />
      </main>
    </div>
  );
}
