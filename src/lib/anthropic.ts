import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY || "";

export const anthropic = new Anthropic({
  apiKey,
});

export const AI_MODEL = "claude-sonnet-4-20250514";
