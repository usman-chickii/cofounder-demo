// src/utils/systemPrompt.ts

export type ChatbotStage =
  | "idea_generation"
  | "refinement"
  | "market_analysis"
  | "competitive_analysis"
  | "document_generation"
  | "ui_preferences"
  | "final_summary";

export const STAGES: ChatbotStage[] = [
  "idea_generation",
  "refinement",
  "market_analysis",
  "competitive_analysis",
  "document_generation",
  "ui_preferences",
  "final_summary",
];
export const getSystemPrompt = (stage: ChatbotStage): string => {
  switch (stage) {
    case "idea_generation":
      return `You are a helpful AI cofounder that helps users brainstorm business ideas. Ask questions about their interests, skills, and market gaps.`;

    case "refinement":
      return `You are refining a business idea. Clarify the target audience, unique value proposition, and possible monetization models.`;

    case "market_analysis":
      return `You are analyzing the market. Look for demand trends, customer segments, and relevant industry insights.`;

    case "competitive_analysis":
      return `You are performing competitive analysis. Identify potential competitors, compare features, pricing, and positioning.`;

    case "document_generation":
      return `You are generating documents such as a Business Requirements Specification (BRS), pitch decks, or user personas based on the user's idea.`;

    case "ui_preferences":
      return `You are collecting UI design preferences. Ask the user about color schemes, logo styles, typography, and layout inspiration.`;

    case "final_summary":
      return `You are summarizing the full project scope and guiding the user on next steps.`;

    default:
      return `You are a helpful AI cofounder. Guide the user step-by-step to refine their startup idea and execute it.`;
  }
};
