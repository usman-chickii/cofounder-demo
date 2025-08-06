// src/nodes/refinement.node.ts
import { RunnableLambda } from "@langchain/core/runnables";
import { getProjectMetadata } from "../../services/projects.service";
import { getSystemPrompt } from "../../lib/systemPrompt";
import { streamLLM } from "../../services/llm/llmProvider.service";
import { ChatbotStage } from "../../types/chatbot.types";
import { LLMMessage } from "../../types/llm.types";
import { getStageMessages, saveMessage } from "../../services/messages.service";

const STAGE_KEY: ChatbotStage = "refinement";

interface RefinementInput {
  projectId: string;
  userMessage: string;
  onData: (chunk: string) => void;
}

export const refinementNode = new RunnableLambda<
  RefinementInput,
  { stage: ChatbotStage }
>({
  func: async ({ projectId, userMessage, onData }: RefinementInput) => {
    // 1️⃣ Save user message immediately
    saveMessage("user", userMessage, projectId, STAGE_KEY).catch(console.error);

    // 2️⃣ Fetch metadata + previous stage messages in parallel
    const [{ session_metadata, stage_data }, stageMessages] = await Promise.all(
      [getProjectMetadata(projectId), getStageMessages(projectId, STAGE_KEY, 5)]
    );

    const stageMeta = stage_data?.[STAGE_KEY] || {};

    const metaString =
      Object.keys(session_metadata).length || Object.keys(stageMeta).length
        ? JSON.stringify({ session_metadata, stageMeta }, null, 2)
        : "No metadata available yet.";

    const previousMessages = stageMessages.length
      ? stageMessages.map((m) => m.content).join("\n")
      : "No previous messages for this stage.";

    // 3️⃣ Stage-specific system prompt
    const systemPrompt = `
${getSystemPrompt(STAGE_KEY)}

You are in the "${STAGE_KEY}" stage.
The goal is to take the user's existing idea and make it more concrete, clear, and actionable.
Use the metadata and previous messages for context.
Ask clarifying questions if needed.
Do NOT include any metadata in your visible reply.
`;

    const context = `
Project Metadata: ${metaString}
Recent Stage Messages: ${previousMessages}
`;

    const messages: LLMMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "system", content: context },
      { role: "user", content: userMessage },
    ];

    // 4️⃣ Stream LLM output directly to frontend
    let assistantReply = "";
    await streamLLM(messages, (chunk) => {
      assistantReply += chunk;
      onData(chunk);
    });

    // 5️⃣ Save assistant message
    saveMessage("assistant", assistantReply.trim(), projectId, STAGE_KEY).catch(
      console.error
    );

    return { stage: STAGE_KEY };
  },
});
