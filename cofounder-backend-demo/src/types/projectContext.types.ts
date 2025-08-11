import { StageChecklists } from "./checklist.types";

export type ProjectContext = {
  idea_generation?: {
    idea?: string;
  };
  refinement?: {
    refinedIdea?: string;
  };
  market_analysis?: {
    marketOverview?: string;
    competitors?: string[];
  };
  // branding_foundation?: {
  //   branding?: {
  //     name?: string;
  //     tagline?: string;
  //     tone?: string;
  //   };
  // };
  ui_preferences?: {
    colorPalette?: string[];
    layoutPreferences?: string;
    accessibilityNeeds?: string;
    logoStyle?: string;
    typography?: string;
  };
  tech_stack_suggestion?: {
    techStack?: string[];
  };
  document_generation?: {
    summary?: string;
  };
  final_summary?: {
    summary?: string;
  };
  checklist?: Partial<StageChecklists>;
};
