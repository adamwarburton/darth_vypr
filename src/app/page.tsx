"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects, type ProjectWithCounts } from "@/hooks/use-projects";
import { getDemoData } from "@/lib/seed-demo-data";
import { Plus, BarChart3, Clock } from "lucide-react";

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return new Date(dateStr).toLocaleDateString();
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "live") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Live
      </Badge>
    );
  }
  if (status === "closed") {
    return <Badge className="bg-slate-100 text-slate-700">Closed</Badge>;
  }
  return <Badge className="bg-gray-100 text-gray-600">Draft</Badge>;
}

function ProjectCard({ project }: { project: ProjectWithCounts }) {
  const href =
    project.status === "draft"
      ? `/projects/${project.id}/edit`
      : `/projects/${project.id}`;

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <StatusBadge status={project.status} />
          </div>
          {project.category && (
            <Badge variant="outline" className="w-fit mt-1">
              {project.category}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {project.responseCount !== undefined && (
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5" />
                {project.responseCount} responses
              </div>
            )}
            {project.completionRate !== undefined && (
              <span>{project.completionRate}% completion</span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeTime(project.created_at)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
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
  const { projects, loading } = useProjects();

  // Build the in-memory demo project as a fallback
  const demo = getDemoData();
  const demoFallback: ProjectWithCounts = {
    ...demo.project,
    responseCount: demo.responses.length,
    completionRate: Math.round(
      (demo.responses.filter((r) => r.completed_at).length /
        demo.responses.length) *
        100
    ),
  };

  // If the demo project was loaded from DB (with real counts), use it;
  // otherwise prepend the in-memory fallback
  const dbHasDemo = projects.some((p) => p.id === demoFallback.id);
  const allProjects: ProjectWithCounts[] = dbHasDemo
    ? projects
    : [demoFallback, ...projects];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
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
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              New Project
            </Button>
          </Link>
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
