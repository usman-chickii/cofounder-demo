// src/llm/nodes/generalChat.node.ts
import { askLLM } from "../services/llm/llmProvider.service";
import { getProjectContext } from "../services/projects.service";
import { LLMMessage } from "../types/llm.types";

export async function generalChatNode(state: any) {
  console.log("running general chat node");
  const context = await getProjectContext(state.projectId);
  const contextString = JSON.stringify(context, null, 2);
  console.log("contextString", contextString);
  const systemPrompt = `
    You are a business planning assistant trained only to help users with business-related tasks like:

    - Idea generation
    - Refinement
    - Market research
    - Competitor analysis
    - UI and branding preferences
    - Tech stack suggestions
    - Document generation

    Here is the current project context:
    ${contextString}

    If the user message is relevant to the business workflow, help them using this context.

    If the message is unrelated (e.g. jokes, personal questions, chit-chat), respond with:
    "I'm designed specifically to help with business planning. Please ask something related to your project so I can assist you effectively."

    Do not answer unrelated questions.
    `;

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: state.latestMessage },
  ];

  await askLLM(messages, "groq").then((response) => {
    state.onData(response);
  });

  return {};
}
