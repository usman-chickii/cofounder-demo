// src/services/llm/llmProvider.service.ts
import { ENV } from "../../config/env";
import { askGroq, streamGroq } from "./groq.service";
import { ChatbotStage } from "../../types/chatbot.types";
import { LLMMessage } from "../../types/llm.types";

export const askLLM = async (
  messages: LLMMessage[],
  providerOverride?: "groq" | "openai" | "claude"
) => {
  const provider = providerOverride || ENV.DEFAULT_LLM_PROVIDER;

  switch (provider) {
    case "groq":
      return askGroq(messages);
    case "openai":
      throw new Error("OpenAI is not supported yet");
    case "claude":
      throw new Error("Claude is not supported yet");
    default:
      throw new Error("Invalid provider");
  }
};

export const streamLLM = async (
  messages: LLMMessage[],
  stage: ChatbotStage,
  onData: (chunk: string) => void,
  providerOverride?: "groq" | "openai" | "claude"
) => {
  const provider = providerOverride || ENV.DEFAULT_LLM_PROVIDER;

  switch (provider) {
    case "groq":
      return streamGroq(messages, onData);
    case "openai":
      throw new Error("OpenAI is not supported yet");
    case "claude":
      throw new Error("Claude is not supported yet");
    default:
      throw new Error("Invalid provider");
  }
};
