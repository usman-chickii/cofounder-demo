import { STAGE_GOALS } from "./stageGoals";

export const supervisorPrompt = ({
  currentStage,
  stageGoal,
  completionCriteria,
  stageMessages,
  userMessage,
}: {
  currentStage: string;
  stageGoal: string;
  completionCriteria: string[];
  stageMessages: string;
  userMessage: string;
}) =>
  `
You are a workflow supervisor for a business-idea chatbot.

Available stages (with meanings):
${Object.entries(STAGE_GOALS)
  .map(([stage, goal]) => `- ${stage}: ${goal}`)
  .join("\n")}
- general_chat: Casual or miscellaneous conversation that does not match any other stage.

Your task:
1. Read the user's latest message carefully.
2. Determine the single most relevant stage **purely based on message content**, ignoring the current stage if needed.
3. Only choose "general_chat" if the message clearly does not fit ANY specific stage above.
4. After determining the target_stage, evaluate whether the current stage's completion criteria are met.

Current Stage (for context only): ${currentStage}
Stage goal: ${stageGoal}
Stage completion criteria:
${completionCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Conversation so far in this stage:
${stageMessages || "<no messages>"}

New user input:
${userMessage}

Respond ONLY with valid JSON in this shape:
{
  "action": "continue_stage" | "move_next_stage" | "go_previous_stage" | "direct_answer" | "ask_clarifying_question",
  "target_stage": "<stage name from list or general_chat>",
  "completion_status": "COMPLETE" | "INCOMPLETE",
  "reason": "<1-2 sentence explanation>",
  "suggested_questions": ["optional follow-up question 1", "optional follow-up question 2"],
  "confidence": 0.0
}

Do NOT output anything outside the JSON.
  `.trim();
