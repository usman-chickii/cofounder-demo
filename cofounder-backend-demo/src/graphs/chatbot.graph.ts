// src/graphs/chatbot.graph.ts
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatbotStage } from "../types/chatbot.types";
import { generalChatNode } from "../nodes/generalChat.node";
import { streamLLM } from "../services/llm/llmProvider.service";
import {
  getCompletedStages,
  getProjectStage,
} from "../services/projects.service";
import { routerNode } from "../nodes/router.node";
import { ideaGenerationNode } from "../nodes/stages_nodes/ideaGeneration.node";
import { refinementNode } from "../nodes/stages_nodes/refinement.node";

const StateAnnotation = Annotation.Root({
  projectId: Annotation<string>(),
  latestMessage: Annotation<string>(),
  parsedIntent: Annotation<string>(),
  nextStage: Annotation<ChatbotStage | "general_chat" | undefined>(),
  onData: Annotation<(chunk: string) => void>(),
});

// // 1️⃣ Intent classification (LLM only)
// const intentClassificationNode = async (state: any) => {
//   console.log("📍 Entering intentClassificationNode");
//   const { intent } = await detectIntentNode({
//     projectId: state.projectId,
//     latestMessage: state.latestMessage,
//   });
//   console.log("🧠 Detected intent:", intent);

//   return { parsedIntent: intent };
// };

// // 2️⃣ Router (backend rules)
// const routerStateNode = async (state: any) => {
//   const completedStages = await getCompletedStages(state.projectId);
//   const currentStage = await getProjectStage(state.projectId);
//   console.log("📍 Entering routerStateNode");
//   console.log("parsedIntent from state:", state.parsedIntent);
//   console.log("currentStage from DB:", currentStage);
//   console.log("completedStages from DB:", completedStages);

//   const { nextStage } = await routerNode({
//     parsedIntent: state.parsedIntent,
//     currentStage: currentStage || "idea_generation",
//     completedStages,
//     projectId: state.projectId,
//   });
//   console.log("📍 Router decided nextStage:", nextStage);

//   return { nextStage };
// };

// 1️⃣ Intent classification node
const intentClassificationNode = async (state: any) => {
  const systemPrompt = `
    Your job is to classify the user's latest message into one of these stages:
    ["idea_generation", "refinement", "market_analysis", "competitive_analysis", "document_generation", "ui_preferences", "final_summary", "general_chat"]
  
    Reply with only the stage name.
    `;

  let reply = "";
  await streamLLM(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: state.latestMessage },
    ],
    (chunk) => (reply += chunk)
  );

  const stage = reply.trim() as ChatbotStage | "general_chat";
  console.log("🧠 Detected stage:", stage);

  return { parsedIntent: stage };
};

// 2️⃣ Router node
const routerStateNode = async (state: any) => {
  const completedStages = await getCompletedStages(state.projectId);
  const currentStage = await getProjectStage(state.projectId);

  const { nextStage } = await routerNode({
    parsedIntent: state.parsedIntent,
    currentStage: currentStage || "idea_generation",
    completedStages,
    projectId: state.projectId,
  });

  return { nextStage };
};

// 3️⃣ Stage handler
const stageHandlerStateNode = async (state: any) => {
  console.log("📍 Stage handler running:", state.nextStage);

  if (state.nextStage === "idea_generation") {
    await ideaGenerationNode.invoke({
      projectId: state.projectId,
      userMessage: state.latestMessage,
      onData: state.onData,
    });
  } else if (state.nextStage === "refinement") {
    await refinementNode.invoke({
      projectId: state.projectId,
      userMessage: state.latestMessage,
      onData: state.onData,
    });
  } else {
    await generalChatNode({
      projectId: state.projectId,
      latestMessage: state.latestMessage,
      onData: state.onData,
    });
  }

  return {};
};

// 4️⃣ Graph definition
const graph = new StateGraph(StateAnnotation)
  .addNode("intent_classification", intentClassificationNode)
  .addNode("router", routerStateNode)
  .addNode("stage_handler", stageHandlerStateNode)
  .addNode("general_chat", generalChatNode)

  .addEdge("__start__", "intent_classification")
  .addEdge("intent_classification", "router")

  .addConditionalEdges("router", (state) => {
    if (state.nextStage === "general_chat") return "general_chat";
    return "stage_handler";
  });

export const chatbotGraph = graph.compile();
