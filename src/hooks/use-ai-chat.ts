"use client";

import { useCallback, useState } from "react";
import type { AiChatMessage } from "@/types";

export function useAiChat(projectId: string) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai/assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, message: content }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to get AI response");
        }

        const data = await res.json();

        // Add both user and assistant messages
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            project_id: projectId,
            role: "user",
            content,
            created_at: new Date().toISOString(),
          },
          {
            id: data.messageId,
            project_id: projectId,
            role: "assistant",
            content: data.reply,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, loading, error, sendMessage, clearMessages };
}
