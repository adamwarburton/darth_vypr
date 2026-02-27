"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/use-projects";
import { getDemoData } from "@/lib/seed-demo-data";
import type { Project } from "@/types";
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

interface ProjectWithStats extends Project {
  responseCount?: number;
  completionRate?: number;
}

function ProjectCard({ project }: { project: ProjectWithStats }) {
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

export default function DashboardPage() {
  const { projects, loading } = useProjects();

  // Include demo project for demo purposes
  const demo = getDemoData();
  const demoProject: ProjectWithStats = {
    ...demo.project,
    responseCount: demo.responses.length,
    completionRate: Math.round(
      (demo.responses.filter((r) => r.completed_at).length /
        demo.responses.length) *
        100
    ),
  };

  const allProjects: ProjectWithStats[] =
    projects.length > 0
      ? projects
      : [demoProject];

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
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your consumer research projects
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
