export interface IdeaGenerationChecklist {
  ideaProvided: boolean;
}

export interface RefinementChecklist {
  ideaRefined: boolean;
}

export interface MarketAnalysisChecklist {
  marketOverviewComplete: boolean;
  competitorsListed: boolean;
}

// export interface BrandingChecklist {
//   nameChosen: boolean;
//   taglineChosen: boolean;
//   toneDefined: boolean;
//   colorSchemeSelected: boolean;
//   logoApproved: boolean;
//   typographyChosen: boolean;
//   layoutPreferenceSpecified: boolean;
// }

export interface UIPreferencesChecklist {
  colorPaletteChosen: boolean;
  layoutPreferencesSet: boolean;
  accessibilityNeedsDefined: boolean;
  colorSchemeConfirmed: boolean;
  typographyConfirmed: boolean;
  layoutConfirmed: boolean;
}

export interface TechStackChecklist {
  techStackSelected: boolean;
}

export interface DocumentGenerationChecklist {
  documentsGenerated: boolean;
}

export interface FinalSummaryChecklist {
  summaryConfirmed: boolean;
}

export interface StageChecklists {
  idea_generation: IdeaGenerationChecklist;
  refinement: RefinementChecklist;
  market_analysis: MarketAnalysisChecklist;
  // branding_foundation: BrandingChecklist;
  ui_preferences: UIPreferencesChecklist;
  tech_stack_suggestion: TechStackChecklist;
  document_generation: DocumentGenerationChecklist;
  final_summary: FinalSummaryChecklist;
}
