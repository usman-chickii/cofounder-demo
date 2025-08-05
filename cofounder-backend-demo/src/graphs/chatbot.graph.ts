import { StateGraph, Annotation } from "@langchain/langgraph";
import { detectIntentNode } from "../nodes/detectIntent.node";
import { chatHandlerNode } from "../nodes/chatHandle.node";
import { ChatbotStage } from "../types/chatbot.types";

// 1️⃣ Define the state annotations
const StateAnnotation = Annotation.Root({
  projectId: Annotation<string>(),
  latestMessage: Annotation<string>(),
  stage: Annotation<ChatbotStage | undefined>(),
  onData: Annotation<(chunk: string) => void>(),
});

// 2️⃣ Create the graph with this state definition
const graph = new StateGraph(StateAnnotation)
  .addNode("detect_intent", async (state) => {
    const { stage } = await detectIntentNode({
      projectId: state.projectId,
      latestMessage: state.latestMessage,
    });
    console.log(`🧠 Detected intent for project ${state.projectId}: ${stage}`);
    return { stage };
  })
  .addNode("chat_handler", async (state) => {
    if (!state.stage) throw new Error("Stage not set before chat handler");
    await chatHandlerNode({
      projectId: state.projectId,
      latestMessage: state.latestMessage,
      stage: state.stage,
      onData: state.onData,
    });
    return {};
  })

  // ✅ Tell LangGraph the starting node
  .addEdge("__start__", "detect_intent")

  // ✅ Then connect detect_intent → chat_handler
  .addEdge("detect_intent", "chat_handler");

export const chatbotGraph = graph.compile();
