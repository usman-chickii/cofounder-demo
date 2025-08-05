import { getMessages, saveMessage } from "../services/messages.service";
import { getSystemPrompt } from "../lib/systemPrompt";
import { streamLLM } from "../services/llm/llmProvider.service";
import { ChatbotStage } from "../types/chatbot.types";
import { LLMMessage } from "../types/llm.types";

export async function chatHandlerNode({
  projectId,
  latestMessage,
  stage,
  onData,
}: {
  projectId: string;
  latestMessage: string;
  stage: ChatbotStage;
  onData: (chunk: string) => void;
}) {
  // Save the latest user message
  await saveMessage("user", latestMessage, projectId);

  // Fetch recent conversation (include system prompt at the start)
  const pastMessages = await getMessages(projectId, 20); // or all if you want full context

  const messages: LLMMessage[] = [
    { role: "system", content: getSystemPrompt(stage) },
    ...pastMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: latestMessage },
  ];

  // Stream response from LLM
  let fullAssistantResponse = "";
  await streamLLM(messages, stage, (chunk) => {
    fullAssistantResponse += chunk;
    onData(chunk);
  });

  // Save assistant reply
  await saveMessage("assistant", fullAssistantResponse, projectId);

  return { success: true };
}
