"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/types";

export interface ProjectWithCounts extends Project {
  responseCount?: number;
  completionRate?: number;
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const projectList = (data as unknown as Project[]) ?? [];

    // Fetch response counts for each project
    const enriched: ProjectWithCounts[] = await Promise.all(
      projectList.map(async (p) => {
        const { count: totalCount } = await supabase
          .from("responses")
          .select("*", { count: "exact", head: true })
          .eq("project_id", p.id);

        const { count: completedCount } = await supabase
          .from("responses")
          .select("*", { count: "exact", head: true })
          .eq("project_id", p.id)
          .not("completed_at", "is", null);

        const total = totalCount ?? 0;
        const completed = completedCount ?? 0;

        return {
          ...p,
          responseCount: total,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
    );

    setProjects(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}
