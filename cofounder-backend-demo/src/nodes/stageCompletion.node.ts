import { askLLM } from "../services/llm/llmProvider.service";

export const stageCompletionNode = async (state: any) => {
  const userMessage = state.latestMessage;

  const systemPrompt = `
You are an assistant that determines if the user has confirmed completion of the current stage in a multi-stage workflow.

Respond with exactly one word:
- "COMPLETE" if the user confirms or approves the current stage results (e.g., "these decisions are perfect", "looks good", "no changes needed").
- "INCOMPLETE" otherwise.

Examples:
User: These decisions are perfect.
Response: COMPLETE

User: Looks good to me.
Response: COMPLETE

User: Can we change the color scheme?
Response: INCOMPLETE

User: No changes needed.
Response: COMPLETE

User: I want to discuss typography more.
Response: INCOMPLETE

Now check this message:
User: ${userMessage}
Response:
  `;

  const reply = await askLLM([{ role: "system", content: systemPrompt }]);
  const trimmed = reply.trim().toUpperCase();

  console.log("Stage completion check response:", trimmed);

  const isComplete = trimmed === "COMPLETE";
  return { isComplete };
};
