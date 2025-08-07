// src/llm/nodes/router.node.ts
import { ChatbotStage } from "../types/chatbot.types";
import { STAGES } from "../types/chatbot.types";
import {
  getNextUncompletedStage,
  getPreviousUncompletedStage,
  setProjectStage,
} from "../services/projects.service";

interface RouteIntentParams {
  parsedIntent: string;
  currentStage?: ChatbotStage;
  completedStages: ChatbotStage[];
  projectId: string;
}

export async function routerNode({
  parsedIntent,
  currentStage,
  completedStages,
  projectId,
}: RouteIntentParams): Promise<{ nextStage: ChatbotStage | "general_chat" }> {
  let nextStage: ChatbotStage | "general_chat" =
    currentStage || "idea_generation";

  if (STAGES.includes(parsedIntent as ChatbotStage)) {
    // Explicit stage change
    nextStage = parsedIntent as ChatbotStage;
  } else if (parsedIntent === "skip_stage") {
    nextStage =
      getNextUncompletedStage(currentStage, completedStages) ||
      currentStage ||
      "idea_generation";
  } else if (parsedIntent === "back_stage") {
    nextStage =
      getPreviousUncompletedStage(currentStage, completedStages) ||
      currentStage ||
      "idea_generation";
  } else if (parsedIntent === "unknown") {
    nextStage = "general_chat"; // fallback
  }

  // Save in DB if it's part of workflow
  if (STAGES.includes(nextStage as ChatbotStage)) {
    await setProjectStage(projectId, nextStage as ChatbotStage);
  }

  return { nextStage };
}
