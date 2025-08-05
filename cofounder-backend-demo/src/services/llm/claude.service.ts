// src/services/llm/claude.service.ts

import { Anthropic } from "@anthropic-ai/sdk";
import { ENV } from "../../config/env";
import { LLMMessage } from "../../types/llm.types";

const anthropic = new Anthropic({
  apiKey: ENV.CLAUDE_API_KEY,
});

export const askClaude = async (messages: LLMMessage[]) => {
  const systemPrompt = messages.find((m) => m.role === "system")?.content ?? "";
  const userMessages = messages.filter(
    (m) => m.role === "user" || m.role === "assistant"
  );

  const completion = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    system: systemPrompt,
    messages: userMessages as any,
  });

  const content = completion.content?.[0];

  if (content && content.type === "text") {
    return content.text;
  }

  return "Sorry, I couldn't generate a response.";
};
export const streamClaude = async (
  messages: LLMMessage[],
  onData: (chunk: string) => void
) => {
  const systemPrompt = messages.find((m) => m.role === "system")?.content ?? "";
  const userMessages = messages.filter(
    (m) => m.role === "user" || m.role === "assistant"
  );

  const stream = anthropic.messages.stream({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    system: systemPrompt,
    messages: userMessages as any,
  });

  for await (const message of await stream) {
    if (
      message.type === "content_block_delta" &&
      "delta" in message &&
      "text" in message.delta
    ) {
      onData(message.delta.text);
    }
  }
};
