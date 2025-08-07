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

Your task is to extract only relevant structured data from the assistant's reply during the "${stage}" stage of a business idea discussion.

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
    "accessibilityNeeds": string[] (optional)
  } (optional),
  "techStack": string[] (optional),
  "summary": string (optional)
}

🔒 Strict extraction rules:
- Only include fields related to the current stage: "${stage}".
- Only include fields that are explicitly stated or clearly required by the assistant's reply.
- Omit all fields unrelated to the current stage, even if mentioned.
- Do NOT infer values from unrelated context.
- Do not include null, undefined, empty strings, or empty arrays.
- Do not guess or generate values not present in the assistant reply.
- Do not include keys outside the schema.
- ONLY return a raw JSON object with no explanation or commentary.
- DO NOT include phrases like "Here is the JSON", "Output:", or use markdown.
- Return ONLY the JSON object, starting and ending with curly braces.

This is for a partial update — do NOT delete or overwrite existing fields not mentioned in the reply.

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
    .replace(/```json|```/g, "") // remove markdown code blocks
    .replace(/^.*?\{/, "{") // remove everything before first {
    .replace(/\}[^}]*$/, "}"); // remove anything after last }

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (err) {
    console.error("❌ Still failed to parse JSON:", cleaned);
  }

  return null;
}
