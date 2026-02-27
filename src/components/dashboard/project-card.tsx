"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Edit3,
  MoreHorizontal,
  Users,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    status: "draft" | "live" | "closed";
    responseCount: number;
    questionCount: number;
    completionRate: number;
    createdAt: string;
  };
}

const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  live: {
    label: "Live",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <div className="group relative rounded-xl border border-white/[0.06] bg-[#141933] p-5 transition-all duration-200 hover:border-vypr-teal/20 hover:shadow-[0_0_24px_rgba(0,214,198,0.06)]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="mb-2 flex items-center gap-2.5">
            <Badge
              variant="outline"
              className={`text-[11px] font-medium ${status.className}`}
            >
              {status.label === "Live" && (
                <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-emerald-400" />
              )}
              {status.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(project.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <h3 className="font-heading text-[15px] font-semibold leading-snug text-foreground">
            {project.title}
          </h3>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/[0.03] px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Responses
            </span>
          </div>
          <p className="mt-1 font-heading text-lg font-bold text-foreground">
            {project.responseCount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BarChart3 className="size-3" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Questions
            </span>
          </div>
          <p className="mt-1 font-heading text-lg font-bold text-foreground">
            {project.questionCount}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="size-3" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Complete
            </span>
          </div>
          <p className="mt-1 font-heading text-lg font-bold text-vypr-teal">
            {project.completionRate}%
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-vypr-teal to-vypr-teal-dim transition-all duration-500"
            style={{ width: `${project.completionRate}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/projects/${project.id}`} className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <BarChart3 className="size-3.5" />
            Results
            <ArrowUpRight className="ml-auto size-3 opacity-50" />
          </Button>
        </Link>
        <Link href={`/projects/${project.id}/edit`} className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="size-3.5" />
            Edit
            <ArrowUpRight className="ml-auto size-3 opacity-50" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
