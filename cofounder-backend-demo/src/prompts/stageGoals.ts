// config/stageGoals.ts
export const STAGE_GOALS = {
  idea_generation: {
    goal: "Generate and capture a clear, well-defined business or product idea based on the user's initial vision.",
    completionCriteria: [
      "User has provided at least one concrete idea",
      "Idea is described in enough detail to proceed",
      "Any major ambiguities have been clarified",
    ],
  },
  refinement: {
    goal: "Improve and clarify the chosen idea by discussing specifics, narrowing scope, and ensuring feasibility.",
    completionCriteria: [
      "Ambiguities in the idea are resolved",
      "Scope is realistic and achievable",
      "User is satisfied with the refined version",
    ],
  },
  competitive_analysis: {
    goal: "Research and identify competitors, comparing strengths, weaknesses, and differentiators.",
    completionCriteria: [
      "List of key competitors identified",
      "Competitor strengths and weaknesses noted",
      "Unique positioning for the user's idea established",
    ],
  },
  market_analysis: {
    goal: "Assess target market, audience segments, and potential demand for the idea.",
    completionCriteria: [
      "Target audience clearly defined",
      "Market size and trends discussed",
      "Opportunities and challenges identified",
    ],
  },
  branding_foundation: {
    goal: "Establish brand identity elements such as name, tone, and values.",
    completionCriteria: [
      "Brand name or shortlist agreed",
      "Brand tone and values documented",
      "User confirms alignment with vision",
    ],
  },
  ui_preferences: {
    goal: "Understand user interface preferences and style direction for product design.",
    completionCriteria: [
      "Preferred styles and colors identified",
      "Layout and design expectations clarified",
      "Any inspiration references collected",
    ],
  },
  tech_stack_suggestions: {
    goal: "Recommend suitable technologies and tools for building the product.",
    completionCriteria: [
      "Frontend and backend technologies selected or shortlisted",
      "Database and infrastructure options discussed",
      "User agrees on a preliminary tech approach",
    ],
  },
  document_generation: {
    goal: "Compile all previous stage outputs into a cohesive project document.",
    completionCriteria: [
      "All sections from previous stages included",
      "Document is organized and readable",
      "User approves the document content",
    ],
  },
  final_summary: {
    goal: "Provide a final, concise summary of the entire project plan.",
    completionCriteria: [
      "Summary includes all key points from previous stages",
      "Tone and style are clear and professional",
      "User confirms summary is accurate",
    ],
  },
} as const;
