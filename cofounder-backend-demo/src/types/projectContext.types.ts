export type ProjectContext = {
  idea?: string;
  refinedIdea?: string;
  marketOverview?: string;
  competitors?: string[];
  branding?: {
    name?: string;
    tagline?: string;
    tone?: string;
  };
  uiPreferences?: {
    colorPalette?: string[];
    layoutPreferences?: string;
    accessibilityNeeds?: string;
  };
  techStack?: string[];
  summary?: string;
};

//intent classifciaton
//metadata updation
