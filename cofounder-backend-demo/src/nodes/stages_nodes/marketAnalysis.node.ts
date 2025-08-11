import { RunnableLambda } from "@langchain/core/runnables";
import { getSystemPrompt } from "../../lib/systemPrompt";
import { streamLLM } from "../../services/llm/llmProvider.service";
import { ChatbotStage } from "../../types/chatbot.types";
import { LLMMessage } from "../../types/llm.types";
import { saveMessage } from "../../services/messages.service";
import { buildContextPrompt } from "../../utils/contextBuilder";
import { extractMetadataFromReply } from "../../lib/extractMetaData";
import { updateProjectContext } from "../../services/projects.service";

const STAGE_KEY: ChatbotStage = "market_analysis";
const PRELOADED_PROMPT = getSystemPrompt(STAGE_KEY);

interface MarketAnalysisInput {
  projectId: string;
  userMessage: string;
  onData: (chunk: string) => void;
}

export const marketAnalysisNode = new RunnableLambda<
  MarketAnalysisInput,
  { stage: ChatbotStage }
>({
  func: async ({ projectId, userMessage, onData }: MarketAnalysisInput) => {
    saveMessage("user", userMessage, projectId, STAGE_KEY).catch(console.error);

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
    const extracted = await extractMetadataFromReply(assistantReply, STAGE_KEY);
    if (extracted) {
      await updateProjectContext(projectId, STAGE_KEY, extracted);
    }
    return { stage: STAGE_KEY };
  },
});
