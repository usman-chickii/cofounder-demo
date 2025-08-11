import { askLLM } from "../services/llm/llmProvider.service";
import { ChatbotStage } from "../types/chatbot.types";
import { LLMMessage } from "../types/llm.types";
import { ProjectContext } from "../types/projectContext.types";

const fullProjectContextSchema = {
  idea_generation: {
    idea: "string (optional)",
  },
  refinement: {
    refinedIdea: "string (optional)",
  },
  market_analysis: {
    marketOverview: "string (optional)",
    competitors: "string[] (optional)",
  },
  branding_foundation: {
    branding: {
      name: "string (optional)",
      tagline: "string (optional)",
      tone: "string (optional)",
    },
  },
  ui_preferences: {
    colorPalette: "string[] (optional)",
    layoutPreferences: "string (optional)",
    accessibilityNeeds: "string (optional)",
    logoStyle: "string (optional)",
    typography: "string (optional)",
  },
  tech_stack_suggestion: {
    techStack: "string[] (optional)",
  },
  document_generation: {
    summary: "string (optional)",
  },
  final_summary: {
    summary: "string (optional)",
  },
};
function getStageSchema(stage: ChatbotStage) {
  return JSON.stringify(
    fullProjectContextSchema[stage as keyof typeof fullProjectContextSchema],
    null,
    2
  );
}

export async function extractMetadataFromReply(
  reply: string,
  stage: ChatbotStage
): Promise<Partial<ProjectContext> | null> {
  const extractionPrompt = `
You are a metadata extraction assistant.

Extract structured data from the assistant's reply during the "${stage}" stage of a business idea discussion.

Return a JSON object with exactly one key "${stage}" whose value is an object with fields only from this schema:

${getStageSchema(stage)}

Do NOT include any keys or data outside this schema.

If no relevant data is present for the stage, return an empty object under the stage key.

Return ONLY the JSON object, no explanation, no markdown.

Assistant reply:
"""
${reply}
"""
`.trim();

  const messages: LLMMessage[] = [
    { role: "system", content: extractionPrompt },
  ];

  const jsonOutput = await askLLM(messages);
  console.log("jsonOutput", jsonOutput);

  const cleaned = jsonOutput
    .replace(/```json|```/g, "")
    .replace(/^.*?\{/, "{")
    .replace(/\}[^}]*$/, "}");

  try {
    const parsed = JSON.parse(cleaned);
    if (
      parsed &&
      typeof parsed === "object" &&
      stage in parsed &&
      typeof parsed[stage] === "object"
    ) {
      return { [stage]: parsed[stage] };
    }
  } catch (err) {
    console.error("Failed to parse JSON:", cleaned);
  }

  return null;
}
