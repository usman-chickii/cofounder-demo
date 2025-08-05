//src/services/llm/openaiClient.ts
import OpenAI from "openai";
import { ENV } from "../../config/env";

const apiKey = ENV.OPENAI_API_KEY;
if (!apiKey) throw new Error("Missing OPENAI_API_KEY in environment variables");

const openai = new OpenAI({ apiKey });

export const askOpenAI = async (message: string) => {
  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: message }],
    stream: false,
  });

  return chat.choices[0]?.message.content;
};

export const streamOpenAI = async (
  message: string,
  onData: (chunk: string) => void
) => {
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: message }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) onData(content);
  }
};
