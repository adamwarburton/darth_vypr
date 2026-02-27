import { NextRequest, NextResponse } from "next/server";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { createServerClient } from "@/lib/supabase/server";
import type { AiAssistRequest, ApiError } from "@/types";

const SYSTEM_PROMPT = `You are an expert research methodologist and survey design specialist working within Vypr, an AI-native consumer insights platform. You have deep expertise in:

- Survey design and questionnaire methodology
- Consumer insights and behavioral science
- FMCG product development and market research
- Statistical analysis and research validity
- Question wording, bias avoidance, and response scale design

Help users create better surveys by suggesting improvements to question wording, recommending appropriate question types, generating answer options, and providing best-practice guidance. Be concise, practical, and specific in your suggestions.`;

export async function POST(request: NextRequest) {
  const body: AiAssistRequest = await request.json();
  const { projectId, message, context } = body;

  if (!projectId || !message?.trim()) {
    return NextResponse.json(
      { error: "projectId and message are required" } satisfies ApiError,
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Store the user message
  await supabase.from("ai_chat_messages").insert({
    project_id: projectId,
    role: "user",
    content: message,
  });

  // Build context for the AI
  let contextMessage = "";
  if (context) {
    contextMessage = `\n\nCurrent project context:\n- Title: ${context.title ?? "Untitled"}\n- Description: ${context.description ?? "None"}`;
    if (context.questions?.length) {
      contextMessage += `\n- Questions (${context.questions.length}):\n`;
      context.questions.forEach((q, i) => {
        contextMessage += `  ${i + 1}. [${q.type}] ${q.title}\n`;
      });
    }
  }

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${message}${contextMessage}`,
        },
      ],
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Store the assistant message
    const { data: savedMessage } = await supabase
      .from("ai_chat_messages")
      .insert({
        project_id: projectId,
        role: "assistant",
        content: reply,
      })
      .select()
      .single();

    const msg = savedMessage as unknown as { id: string } | null;
    return NextResponse.json({
      reply,
      messageId: msg?.id ?? "",
    });
  } catch (err) {
    const errMessage =
      err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json(
      { error: errMessage } satisfies ApiError,
      { status: 500 }
    );
  }
}
