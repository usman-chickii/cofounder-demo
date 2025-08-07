// src/llm/nodes/detectIntent.node.ts
import { z } from "zod";
import { getMessages } from "../services/messages.service";
import { setProjectStage } from "../services/projects.service";
import { ChatbotStage } from "../types/chatbot.types";
import { askLLM } from "../services/llm/llmProvider.service";
import { LLMMessage } from "../types/llm.types";

type IntentType = ChatbotStage | "skip_stage" | "back_stage" | "general_chat";

const STAGES = [
  "idea_generation",
  "refinement",
  "market_analysis",
  "competitive_analysis",
  "document_generation",
  "ui_preferences",
  "final_summary",
  "branding_foundation",
  "tech_stack_suggestion",
] as const;

const intentSchema = z.object({
  intent: z.enum([...STAGES, "skip_stage", "back_stage", "general_chat"]),
});

export async function detectIntentNode({
  projectId,
  latestMessage,
}: {
  projectId: string;
  latestMessage: string;
}): Promise<{ intent: IntentType }> {
  // 1️⃣ Check for existing stage
  // const existingStage = await getProjectStage(projectId);
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
You are an intent classifier.

Valid intents: idea_generation, refinement, market_analysis, competitive_analysis, document_generation, ui_preferences, final_summary, skip_stage, back_stage, unknown.

Based ONLY on the latest user message, classify which intent it matches best.

Return ONLY JSON: {"intent": "<intent_name>"}.


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
  const llmResponse = await askLLM(llmMessages, "groq");
  console.log("🧠 LLM response:", llmResponse);

  if (!llmResponse) {
    throw new Error("No response from LLM");
  }

  // 7️⃣ Extract and validate
  let parsedIntent: IntentType;
  try {
    const parsed = JSON.parse(llmResponse);
    parsedIntent = intentSchema.parse(parsed).intent;
  } catch (err) {
    console.error("❌ Intent parsing failed:", err, "LLM output:", llmResponse);
    parsedIntent = "general_chat"; // fallback
  }
  console.log(`🧠 Detected intent for project ${projectId}: ${parsedIntent}`);

  // 8️⃣ Save stage
  if (STAGES.includes(parsedIntent as ChatbotStage)) {
    await setProjectStage(projectId, parsedIntent as ChatbotStage);
  }

  console.log("✅ detectIntentNode returning intent:", parsedIntent);
  return { intent: parsedIntent };
}
