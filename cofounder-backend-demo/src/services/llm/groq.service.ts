// src/services/llm/groq.service.ts
import { ChatGroq } from "@langchain/groq";
import { LLMMessage } from "../../types/llm.types";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: process.env.LLM_MODEL || "llama3-8b-8192",
  temperature: 0,
});

// Convert our LLMMessage to LangChain BaseMessageLike[]
function toLangChainMessages(messages: LLMMessage[]) {
  return messages.map((msg) => {
    switch (msg.role) {
      case "system":
        return new SystemMessage(msg.content);
      case "user":
        return new HumanMessage(msg.content);
      case "assistant":
        return new AIMessage(msg.content);
      default:
        throw new Error(`Unsupported role: ${msg.role}`);
    }
  });
}

export async function askGroq(messages: LLMMessage[]): Promise<string> {
  const lcMessages = toLangChainMessages(messages);
  const response = await groqModel.invoke(lcMessages);
  return response?.content?.toString() ?? "";
}

export async function streamGroq(
  messages: LLMMessage[],
  onData: (chunk: string) => void
) {
  const lcMessages = toLangChainMessages(messages);
  const stream = await groqModel.stream(lcMessages);
  for await (const chunk of stream) {
    onData(chunk?.content?.toString() ?? "");
  }
}
