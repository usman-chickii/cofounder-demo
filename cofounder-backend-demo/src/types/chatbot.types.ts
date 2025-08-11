export type ChatbotStage =
  | "idea_generation"
  | "refinement"
  | "market_analysis"
  | "competitive_analysis"
  | "document_generation"
  // | "branding_foundation"
  | "tech_stack_suggestion"
  | "ui_preferences"
  | "final_summary";

export const STAGES: ChatbotStage[] = [
  "idea_generation",
  "refinement",
  "market_analysis",
  "competitive_analysis",
  "document_generation",
  // "branding_foundation",
  "tech_stack_suggestion",
  "ui_preferences",
  "final_summary",
];
