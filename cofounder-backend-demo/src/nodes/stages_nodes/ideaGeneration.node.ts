import { RunnableLambda } from "@langchain/core/runnables";
import { getProjectMetadata } from "../../services/projects.service";
import { getSystemPrompt } from "../../lib/systemPrompt";
import { streamLLM } from "../../services/llm/llmProvider.service";
import { ChatbotStage } from "../../types/chatbot.types";
import { LLMMessage } from "../../types/llm.types";
import { getStageMessages, saveMessage } from "../../services/messages.service";

const STAGE_KEY: ChatbotStage = "idea_generation";
// Preload system prompt to save ~50-150ms per request
const PRELOADED_PROMPT = getSystemPrompt(STAGE_KEY);

interface IdeaGenInput {
  projectId: string;
  userMessage: string;
  onData: (chunk: string) => void;
}

export const ideaGenerationNode = new RunnableLambda<
  IdeaGenInput,
  { stage: ChatbotStage }
>({
  func: async ({ projectId, userMessage, onData }: IdeaGenInput) => {
    // Fire-and-forget save for user message
    saveMessage("user", userMessage, projectId, STAGE_KEY).catch(console.error);

    // Fetch metadata + previous messages in parallel
    const [metaResult, stageMessages] = await Promise.all([
      getProjectMetadata(projectId),
      getStageMessages(projectId, STAGE_KEY, 5),
    ]);

    const { session_metadata, stage_data } = metaResult;
    const stageMeta = stage_data?.[STAGE_KEY] || {};

    const metaString =
      (session_metadata && Object.keys(session_metadata).length) ||
      (stageMeta && Object.keys(stageMeta).length)
        ? JSON.stringify({ session_metadata, stageMeta }, null, 2)
        : "No metadata available yet.";

    const previousMessages =
      stageMessages.length > 0
        ? stageMessages.map((m) => m.content).join("\n")
        : "No previous messages for this stage.";

    // Build prompt/context
    const systemPrompt = `
${PRELOADED_PROMPT}

You are assisting the user in the "${STAGE_KEY}" stage.
Use the provided metadata and previous messages for context.
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

    let assistantReply = "";

    // Stream response directly, without blocking on DB writes
    await streamLLM(messages, (chunk) => {
      assistantReply += chunk;
      onData(chunk);
    });

    // Save assistant reply in background
    saveMessage("assistant", assistantReply.trim(), projectId, STAGE_KEY).catch(
      console.error
    );

    return { stage: STAGE_KEY };
  },
});
