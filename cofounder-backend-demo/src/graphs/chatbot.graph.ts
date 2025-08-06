// src/graphs/chatbot.graph.ts
import { StateGraph, Annotation } from "@langchain/langgraph";
import { detectIntentNode } from "../nodes/detectIntent.node";
import { routerNode } from "../nodes/router.node";
import { chatHandlerNode } from "../nodes/chatHandle.node";
import {
  getProjectStage,
  getCompletedStages,
} from "../services/projects.service";
import { ChatbotStage } from "../types/chatbot.types";
import { generalChatNode } from "../nodes/generalChat.node";

const StateAnnotation = Annotation.Root({
  projectId: Annotation<string>(),
  latestMessage: Annotation<string>(),
  parsedIntent: Annotation<string>(),
  nextStage: Annotation<ChatbotStage | "general_chat" | undefined>(),
  onData: Annotation<(chunk: string) => void>(),
});

// 1️⃣ Intent classification (LLM only)

const intentClassificationNode = async (state: any) => {
  console.log("📍 Entering intentClassificationNode");
  const { intent } = await detectIntentNode({
    projectId: state.projectId,
    latestMessage: state.latestMessage,
  });
  console.log("🧠 Detected intent:", intent);

  return { parsedIntent: intent };
};

// 2️⃣ Router (backend rules)
const routerStateNode = async (state: any) => {
  const completedStages = await getCompletedStages(state.projectId);
  const currentStage = await getProjectStage(state.projectId);
  console.log("📍 Entering routerStateNode");
  console.log("parsedIntent from state:", state.parsedIntent);
  console.log("currentStage from DB:", currentStage);
  console.log("completedStages from DB:", completedStages);

  const { nextStage } = await routerNode({
    parsedIntent: state.parsedIntent,
    currentStage: currentStage || "idea_generation",
    completedStages,
    projectId: state.projectId,
  });
  console.log("📍 Router decided nextStage:", nextStage);

  return { nextStage };
};

// 3️⃣ Chat handler
const chatHandlerStateNode = async (state: any) => {
  console.log("📍 Entering chatHandlerStateNode with stage:", state.nextStage);

  if (!state.nextStage) throw new Error("No stage set by router");
  await chatHandlerNode({
    projectId: state.projectId,
    latestMessage: state.latestMessage,
    stage: state.nextStage as ChatbotStage,
    onData: state.onData,
  });
  return {};
};

// 4️⃣ Build graph
const graph = new StateGraph(StateAnnotation)

  .addNode("intent_classification", intentClassificationNode)
  .addNode("router", routerStateNode)
  .addNode("chat_handler", chatHandlerStateNode)
  .addNode("general_chat", generalChatNode)

  .addEdge("__start__", "intent_classification")
  .addEdge("intent_classification", "router")

  .addConditionalEdges("router", (state) => {
    console.log("🔀 Router edge decision:", state.nextStage);

    if (state.nextStage === "general_chat") {
      return "general_chat";
    }

    // All other workflow stages go to chat_handler for now
    return "chat_handler";
  });

export const chatbotGraph = graph.compile();
