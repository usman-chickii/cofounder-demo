import { RunnableLambda } from "@langchain/core/runnables";
import { getSystemPrompt } from "../../lib/systemPrompt";
import { streamLLM } from "../../services/llm/llmProvider.service";
import { ChatbotStage } from "../../types/chatbot.types";
import { LLMMessage } from "../../types/llm.types";
import { saveMessage } from "../../services/messages.service";
import { buildContextPrompt } from "../../utils/contextBuilder";
import { updateProjectContext } from "../../services/projects.service";
import { extractMetadataFromReply } from "../../lib/extractMetaData";

const STAGE_KEY: ChatbotStage = "idea_generation";
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

    // Build prompt/context
    const systemPrompt = `
    ${PRELOADED_PROMPT}

    You are assisting the user in the "${STAGE_KEY}" stage.
    Use the previous messages for context if helpful.
    `;

    const context = await buildContextPrompt(projectId, STAGE_KEY);

    const messages: LLMMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "system", content: context },
      { role: "user", content: userMessage },
    ];

    let assistantReply = "";

    await streamLLM(messages, (chunk) => {
      assistantReply += chunk;
      onData(chunk);
    });

    saveMessage("assistant", assistantReply.trim(), projectId, STAGE_KEY).catch(
      console.error
    );

    // Extract & update metadata
    const extracted = await extractMetadataFromReply(assistantReply, STAGE_KEY);
    if (extracted) {
      await updateProjectContext(projectId, STAGE_KEY, extracted);
    }

    return { stage: STAGE_KEY };
  },
});
