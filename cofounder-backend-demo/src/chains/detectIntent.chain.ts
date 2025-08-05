// src/services/llm/chains/detectIntentChain.ts
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatGroq } from "@langchain/groq";
import { getMessages } from "../services/messages.service";
import { ChatbotStage } from "../lib/systemPrompt"; // your type location

// 1️⃣ Use your ChatbotStage type in Zod
const intentSchema = z.object({
  intent: z.custom<ChatbotStage>((val) =>
    [
      "idea_generation",
      "refinement",
      "market_analysis",
      "competitive_analysis",
      "document_generation",
      "ui_preferences",
      "final_summary",
    ].includes(val as string)
  ),
});

const parser = StructuredOutputParser.fromZodSchema(intentSchema);

export async function detectIntentChain(
  projectId: string,
  latestMessage: string
): Promise<{ intent: ChatbotStage }> {
  // Fetch last N messages for context
  const pastMessages = await getMessages(projectId, 6);
  const conversationHistory = pastMessages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  // Few-shot examples
  const fewShotExamples = `
User: Let's start building
Intent: ui_preferences

User: Analyze the market
Intent: market_analysis

User: Keep going
Intent: refinement

User: Generate a BRD
Intent: document_generation
`;

  // Prompt
  const prompt = ChatPromptTemplate.fromTemplate(`
You are an intent classification system for a startup cofounder chatbot.
You must classify the user's latest message into one of the following stages:
idea_generation, refinement, market_analysis, competitive_analysis, document_generation, ui_preferences, final_summary.

If the intent is unclear, KEEP the current stage unless the user explicitly requests a change.

Return ONLY valid JSON matching this format:
${parser.getFormatInstructions()}

Here are some examples for guidance:
${fewShotExamples}

Conversation so far:
${conversationHistory}

Latest user message: {latestMessage}
`);

  // LLM client
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY!,
    modelName: "llama3-8b-8192",
    temperature: 0,
  });

  // Build chain
  const chain = prompt.pipe(model).pipe(parser);

  try {
    const result = await chain.invoke({
      latestMessage,
    });
    return result.intent;
  } catch (error) {
    console.error("Error in detectIntentChain:", error);
    // Fallback — here you could fetch the stored stage from DB instead
    return { intent: "refinement" };
  }
}
