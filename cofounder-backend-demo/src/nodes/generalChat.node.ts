// src/llm/nodes/generalChat.node.ts
import { askLLM } from "../services/llm/llmProvider.service";
import { LLMMessage } from "../types/llm.types";

export async function generalChatNode(state: any) {
  console.log("running general chat node");
  const systemPrompt = `
You are a helpful assistant for a business planning chatbot.
If the user's question is related to the workflow, ask a clarifying question to bring them back on track.
If it's unrelated, just answer it helpfully.
`;

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: state.latestMessage },
  ];

  await askLLM(messages, "groq").then((response) => {
    state.onData(response);
  });

  return {};
}
