"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Response, Answer } from "@/types";

export function useResponses(projectId: string) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [responsesResult, answersResult] = await Promise.all([
      supabase
        .from("responses")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("answers")
        .select("*, responses!inner(project_id)")
        .eq("responses.project_id", projectId),
    ]);

    if (responsesResult.error) {
      setError(responsesResult.error.message);
    } else {
      setResponses((responsesResult.data as unknown as Response[]) ?? []);
    }

    if (answersResult.error) {
      setError((prev) => prev ?? answersResult.error.message);
    } else {
      setAnswers((answersResult.data as unknown as Answer[]) ?? []);
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchResponses();

    // Subscribe to realtime updates on responses
    const responsesChannel = supabase
      .channel(`responses:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "responses",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchResponses();
        }
      )
      .subscribe();

    // Subscribe to realtime updates on answers
    const answersChannel = supabase
      .channel(`answers:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "answers",
        },
        () => {
          fetchResponses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(responsesChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [projectId, fetchResponses]);

  return { responses, answers, loading, error, refetch: fetchResponses };
}
