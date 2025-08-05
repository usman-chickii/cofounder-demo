// src/llm/nodes/detectIntent.node.ts
import { z } from "zod";
import { getMessages } from "../services/messages.service";
import { getProjectStage, setProjectStage } from "../services/projects.service";
import { ChatbotStage } from "../types/chatbot.types";
import { askLLM } from "../services/llm/llmProvider.service";
import { LLMMessage } from "../types/llm.types";

const STAGES = [
  "idea_generation",
  "refinement",
  "market_analysis",
  "competitive_analysis",
  "document_generation",
  "ui_preferences",
  "final_summary",
] as const;

const intentSchema = z.object({
  intent: z.enum(STAGES),
});

export async function detectIntentNode({
  projectId,
  latestMessage,
}: {
  projectId: string;
  latestMessage: string;
}): Promise<{ stage: ChatbotStage }> {
  // 1️⃣ Check for existing stage
  const existingStage = await getProjectStage(projectId);
  const messages = await getMessages(projectId, 6);
  const historyText = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

  // 3️⃣ Few-shot examples
  const fewShotExamples = `
User: Let's start building
{"intent": "ui_preferences"}
User: Analyze the market
{"intent": "market_analysis"}
User: Keep going
{"intent": "refinement"}
User: Generate a BRD
{"intent": "document_generation"}
User: Let's start building
{"intent": "ui_preferences"}
User: Start building the UI
{"intent": "ui_preferences"}
User: Can you design the interface?
{"intent": "ui_preferences"}
User: Choose colors for my website
{"intent": "ui_preferences"}

`;

  const classificationPrompt = `
You are an intent classification assistant for a business-planning chatbot.

Valid stages: ${STAGES.join(", ")}.

Current stage: ${existingStage || "none"}.

RULES:
- Always KEEP the current stage unless the user explicitly requests a different one.
- Use the conversation history to understand what stage we are in.
- Classify UI-related requests as "ui_preferences".

Return ONLY valid JSON: {"intent": "<stage_name>"}.

Examples:
${fewShotExamples}

Conversation so far:
${historyText}

Latest user message:
${latestMessage}
`;

  // 5️⃣ Build messages array for LLM
  const llmMessages: LLMMessage[] = [
    { role: "system", content: "You are an intent classification assistant." },
    { role: "user", content: classificationPrompt },
  ];

  // 6️⃣ Call LLM
  const llmResponse = await askLLM(llmMessages, "idea_generation", "groq");
  console.log("🧠 LLM response:", llmResponse);

  if (!llmResponse) {
    throw new Error("No response from LLM");
  }

  // 7️⃣ Extract and validate
  let parsedIntent: ChatbotStage;
  try {
    const parsed = JSON.parse(llmResponse);
    parsedIntent = intentSchema.parse(parsed).intent;
  } catch (err) {
    console.error("❌ Intent parsing failed:", err, "LLM output:", llmResponse);
    parsedIntent = "idea_generation"; // fallback
  }
  console.log(`🧠 Detected intent for project ${projectId}: ${parsedIntent}`);

  // 8️⃣ Save stage
  await setProjectStage(projectId, parsedIntent);

  return { stage: parsedIntent };
}
