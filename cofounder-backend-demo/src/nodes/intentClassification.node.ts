import { askLLM } from "../services/llm/llmProvider.service";
import { ChatbotStage, STAGES } from "../types/chatbot.types";
import { fewShotExamples } from "../lib/fewShotExamples";
import { getProjectStage, setProjectStage } from "../services/projects.service";

export const intentClassificationNode = async (state: any) => {
  // 1. Fetch current stage from DB
  const currentStage = await getProjectStage(state.projectId);

  // 2. Prompt for LLM
  const systemPrompt = `
    You are a strict classification engine.

    The current stage is: ${currentStage}
    If the current stage is null, undefined, or empty, return "general_chat".

    The user might say things like "next stage", "previous stage", or "go back".
    If so, respond exactly with the next or previous stage name relative to the current stage.
    Otherwise, classify the user's message into exactly one of the following stages:
    ${STAGES.join(", ")}

    Respond ONLY with the stage name. Do not explain.

    Examples:
    ${fewShotExamples}

    Now classify the following user message:
    User: ${state.latestMessage}
    Classification:
  `;

  // 3. Call LLM with system + user messages
  const reply = await askLLM([
    { role: "system", content: systemPrompt },
    { role: "user", content: state.latestMessage },
  ]);

  console.log("reply from intent classification node:", reply);

  // 4. Parse and return stage
  const stage = reply.trim() as ChatbotStage | "general_chat";
  console.log("🧠 Detected stage:", stage);

  if (stage !== "general_chat" && STAGES.includes(stage as ChatbotStage)) {
    await setProjectStage(state.projectId, stage as ChatbotStage);
  }

  return { parsedIntent: stage };
};
