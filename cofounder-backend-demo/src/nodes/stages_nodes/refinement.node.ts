import { RunnableLambda } from "@langchain/core/runnables";
import { getSystemPrompt } from "../../lib/systemPrompt";
import { streamLLM } from "../../services/llm/llmProvider.service";
import { ChatbotStage } from "../../types/chatbot.types";
import { LLMMessage } from "../../types/llm.types";
import { getStageMessages, saveMessage } from "../../services/messages.service";

const STAGE_KEY: ChatbotStage = "refinement";
const PRELOADED_PROMPT = getSystemPrompt(STAGE_KEY);

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
    // Save user message
    saveMessage("user", userMessage, projectId, STAGE_KEY).catch(console.error);

    // Load recent messages for context
    const stageMessages = await getStageMessages(projectId, STAGE_KEY, 5);

    const previousMessages =
      stageMessages.length > 0
        ? stageMessages.map((m) => m.content).join("\n")
        : "No previous messages for this stage.";

    // Build system prompt and context
    const systemPrompt = `
    ${PRELOADED_PROMPT}

    You are assisting the user in the "${STAGE_KEY}" stage.
    Use the previous messages for context if helpful.
    `;

    const context = `
    Recent Stage Messages: ${previousMessages}
    `;

    const messages: LLMMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "system", content: context },
      { role: "user", content: userMessage },
    ];

    // Stream response from LLM
    let assistantReply = "";

    await streamLLM(messages, (chunk) => {
      assistantReply += chunk;
      onData(chunk);
    });

    // Save assistant reply
    saveMessage("assistant", assistantReply.trim(), projectId, STAGE_KEY).catch(
      console.error
    );

    return { stage: STAGE_KEY };
  },
});
