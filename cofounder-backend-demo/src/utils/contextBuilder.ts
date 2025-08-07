// utils/contextBuilder.ts

import { getProjectContext } from "../services/projects.service";
import { getStageMessages } from "../services/messages.service";
import { ChatbotStage } from "../types/chatbot.types";

/**
 * Builds a full context string by combining:
 * - Project metadata (from session_metadata)
 * - Last 5 messages for the current stage
 */
export async function buildContextPrompt(
  projectId: string,
  stage: ChatbotStage
): Promise<string> {
  // 1. Get metadata
  const projectContext = await getProjectContext(projectId);
  const formattedMetadata = projectContext
    ? JSON.stringify(projectContext, null, 2)
    : "No metadata available.";

  // 2. Get last 5 messages for stage
  const stageMessages = await getStageMessages(projectId, stage, 5);
  const previousMessages =
    stageMessages.length > 0
      ? stageMessages.map((m) => m.content).join("\n")
      : "No previous messages for this stage.";

  // 3. Combine
  const context = `
Project Metadata:
${formattedMetadata}

Recent Stage Messages:
${previousMessages}
  `.trim();

  return context;
}
