import { askLLM } from "../services/llm/llmProvider.service";
import { ChatbotStage } from "../types/chatbot.types";
import { LLMMessage } from "../types/llm.types";
import { ProjectContext } from "../types/projectContext.types";

export async function extractMetadataFromReply(
  reply: string,
  stage: ChatbotStage
): Promise<Partial<ProjectContext> | null> {
  const extractionPrompt = `
    You are a metadata extraction assistant.
    
    Your task is to extract relevant structured data from the assistant's reply during the "${stage}" stage of a business idea discussion.
    
    Only return a valid JSON object strictly matching the following ProjectContext structure:
    
    {
      "idea": string (optional),
      "refinedIdea": string (optional),
      "marketOverview": string (optional),
      "competitors": string[] (optional),
      "branding": {
        "name": string (optional),
        "tagline": string (optional),
        "tone": string (optional)
      } (optional),
      "uiPreferences": {
        "colorPalette": string[] (optional),
        "layoutPreferences": string (optional),
        "accessibilityNeeds": string (optional)
      } (optional),
      "techStack": string[] (optional),
      "summary": string (optional)
    }
    
    ⚠️ Only extract and include fields that are relevant to the "${stage}" stage.
    ✅ Omit all unrelated fields, even if mentioned in the reply.
    ✅ Only include fields that are **explicitly stated** or can be **confidently inferred** from the reply.
    ❌ Do not include or overwrite fields from other stages.
    ❌ Do not include null, "", or empty arrays unless the assistant clearly says the value is unknown, empty, or not applicable.
    ❌ Do not include any keys outside this schema.
    ❌ Do not wrap the output in markdown or add explanations.
    
    If nothing relevant can be extracted for this stage, return an empty object: {}
    
    Assistant reply:
    """
    ${reply}
    """
    `;

  const messages: LLMMessage[] = [
    { role: "system", content: extractionPrompt },
  ];

  const jsonOutput = await askLLM(messages);
  console.log("jsonOutput", jsonOutput);

  try {
    const parsed = JSON.parse(jsonOutput.trim());
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (err) {
    console.error("❌ Failed to parse metadata JSON:", jsonOutput);
  }

  return null;
}
