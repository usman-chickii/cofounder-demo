import { RunnableLambda } from "@langchain/core/runnables";
import { getSystemPrompt } from "../../lib/systemPrompt";
import { streamLLM } from "../../services/llm/llmProvider.service";
import { ChatbotStage } from "../../types/chatbot.types";
import { LLMMessage } from "../../types/llm.types";
import { getStageMessages, saveMessage } from "../../services/messages.service";

const STAGE_KEY: ChatbotStage = "ui_preferences";
const PRELOADED_PROMPT = getSystemPrompt(STAGE_KEY);

interface UiPreferencesInput {
  projectId: string;
  userMessage: string;
  onData: (chunk: string) => void;
}

export const uiPreferencesNode = new RunnableLambda<
  UiPreferencesInput,
  { stage: ChatbotStage }
>({
  func: async ({ projectId, userMessage, onData }: UiPreferencesInput) => {
    saveMessage("user", userMessage, projectId, STAGE_KEY).catch(console.error);

    const stageMessages = await getStageMessages(projectId, STAGE_KEY, 5);

    const previousMessages =
      stageMessages.length > 0
        ? stageMessages.map((m) => m.content).join("\n")
        : "No previous messages for this stage.";

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

    let assistantReply = "";

    await streamLLM(messages, (chunk) => {
      assistantReply += chunk;
      onData(chunk);
    });

    saveMessage("assistant", assistantReply.trim(), projectId, STAGE_KEY).catch(
      console.error
    );

    return { stage: STAGE_KEY };
  },
});
