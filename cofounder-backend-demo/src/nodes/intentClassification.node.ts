import { askLLM } from "../services/llm/llmProvider.service";
import { ChatbotStage, STAGES } from "../types/chatbot.types";
import { fewShotExamples } from "../lib/fewShotExamples";

export const intentClassificationNode = async (state: any) => {
  const systemPrompt = `
      You are a strict classification engine.
      
      Classify the user's latest message into **exactly one** of the following stages:
      ${STAGES.join(", ")}
      
      Respond ONLY with the stage name. Do not explain.
      
      Examples:
      ${fewShotExamples}
      
      Now classify the following:
      User: ${state.latestMessage}
      Classification:
      `;

  const reply = await askLLM([
    { role: "system", content: systemPrompt },
    { role: "user", content: state.latestMessage },
  ]);
  console.log("reply from intent classification node:", reply);
  const stage = reply.trim() as ChatbotStage | "general_chat";
  console.log("🧠 Detected stage:", stage);

  return { parsedIntent: stage };
};
