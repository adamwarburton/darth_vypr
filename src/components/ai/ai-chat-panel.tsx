"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Bot, User } from "lucide-react";

const DEMO_MESSAGES = [
  {
    role: "assistant" as const,
    content:
      "I've analysed the results for your Snack Bar study. The data shows strong preference polarisation between Salted Caramel and Dark Chocolate variants. Would you like me to dig deeper into any segment?",
  },
  {
    role: "user" as const,
    content: "What does the Gen Z segment specifically prefer?",
  },
  {
    role: "assistant" as const,
    content:
      "Gen Z respondents (18-24) show a distinct preference pattern: Mango & Coconut scores significantly higher (+12pp vs overall) in this segment, suggesting tropical/exotic flavours resonate. They also rate plant-based protein appeal at 7.9/10 — well above the 6.8 average. Consider a Gen Z-targeted variant.",
  },
];

export function AiChatPanel() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-full flex-col rounded-xl border border-indigo-500/20 bg-[#141933]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10">
          <Sparkles className="size-3.5 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Vypr AI Assistant
          </p>
          <p className="text-[11px] text-muted-foreground">
            Research methodologist
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {DEMO_MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                  msg.role === "assistant"
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "bg-vypr-teal/10 text-vypr-teal"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="size-3.5" />
                ) : (
                  <User className="size-3.5" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                  msg.role === "assistant"
                    ? "bg-white/[0.04] text-foreground/90"
                    : "bg-vypr-teal/10 text-foreground"
                }`}
              >
                <p className="text-[13px] leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your results..."
            className="border-white/[0.06] bg-white/[0.03] text-sm placeholder:text-muted-foreground/50 focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
          />
          <Button
            size="icon"
            className="shrink-0 bg-vypr-teal text-vypr-navy hover:bg-vypr-teal/90"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
