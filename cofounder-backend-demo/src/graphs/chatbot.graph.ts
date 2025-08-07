// src/graphs/chatbot.graph.ts
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatbotStage } from "../types/chatbot.types";
import { generalChatNode } from "../nodes/generalChat.node";
import { askLLM } from "../services/llm/llmProvider.service";
import // getCompletedStages,
// getProjectStage,
"../services/projects.service";
// import { routerNode } from "../nodes/router.node";
import { ideaGenerationNode } from "../nodes/stages_nodes/ideaGeneration.node";
import { refinementNode } from "../nodes/stages_nodes/refinement.node";
import { marketAnalysisNode } from "../nodes/stages_nodes/marketAnalysis.node";
import { competitiveAnalysisNode } from "../nodes/stages_nodes/competitiveAnalysis.node";
import { documentGenerationNode } from "../nodes/stages_nodes/documentGeneration.node";
import { brandingFoundationNode } from "../nodes/stages_nodes/brandingFoundation.node";
import { techStackSuggestionNode } from "../nodes/stages_nodes/techStackSuggestion.node";
import { uiPreferencesNode } from "../nodes/stages_nodes/uiPreferences.node";
import { finalSummaryNode } from "../nodes/stages_nodes/finalSummary.node";
import { STAGES } from "../types/chatbot.types";
import { fewShotExamples } from "../lib/fewShotExamples";

const StateAnnotation = Annotation.Root({
  projectId: Annotation<string>(),
  latestMessage: Annotation<string>(),
  parsedIntent: Annotation<string>(),
  nextStage: Annotation<ChatbotStage | "general_chat" | undefined>(),
  stage: Annotation<ChatbotStage | "general_chat" | undefined>(),
  onData: Annotation<(chunk: string) => void>(),
});

const intentClassificationNode = async (state: any) => {
  const systemPrompt = `
    You are a strict classification engine.
    
    Classify the user's latest message into **exactly one** of the following stages:
    ${STAGES.join(", ")}
    
    Respond ONLY with the stage name. Do not explain.
    
    Examples:
    ${fewShotExamples}
    
    Now classify the following:
    User: ${state.latestMessage}
    Classification:
    `;

  const reply = await askLLM([
    { role: "system", content: systemPrompt },
    { role: "user", content: state.latestMessage },
  ]);
  console.log("reply from intent classification node:", reply);
  const stage = reply.trim() as ChatbotStage | "general_chat";
  console.log("🧠 Detected stage:", stage);

  return { parsedIntent: stage };
};

const routerStateNode = async (state: any) => {
  const stage = state.parsedIntent;

  return {
    nextStage: stage,
    stage,
  };
};

// 3️⃣ Stage handler
const stageHandlerStateNode = async (state: any) => {
  console.log("📍 Stage handler running:", state.stage);

  switch (state.stage) {
    case "idea_generation":
      await ideaGenerationNode.invoke({
        projectId: state.projectId,
        userMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    case "refinement":
      await refinementNode.invoke({
        projectId: state.projectId,
        userMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    case "market_analysis":
      await marketAnalysisNode.invoke({
        projectId: state.projectId,
        userMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    case "competitive_analysis":
      await competitiveAnalysisNode.invoke({
        projectId: state.projectId,
        userMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    case "document_generation":
      await documentGenerationNode.invoke({
        projectId: state.projectId,
        userMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    case "branding_foundation":
      await brandingFoundationNode.invoke({
        projectId: state.projectId,
        userMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    case "tech_stack_suggestion":
      await techStackSuggestionNode.invoke({
        projectId: state.projectId,
        userMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    case "ui_preferences":
      await uiPreferencesNode.invoke({
        projectId: state.projectId,
        userMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    case "final_summary":
      await finalSummaryNode.invoke({
        projectId: state.projectId,
        userMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    case "general_chat":
      await generalChatNode({
        projectId: state.projectId,
        latestMessage: state.latestMessage,
        onData: state.onData,
      });
      break;
    default:
      throw new Error(`Unhandled stage: ${state.stage}`);
  }

  return {};
};

// 4️⃣ Graph definition
const graph = new StateGraph(StateAnnotation)
  .addNode("intent_classification", intentClassificationNode)
  .addNode("router", routerStateNode)
  .addNode("stage_handler", stageHandlerStateNode)

  .addEdge("__start__", "intent_classification")
  .addEdge("intent_classification", "router")

  .addConditionalEdges("router", () => "stage_handler");

export const chatbotGraph = graph.compile();
