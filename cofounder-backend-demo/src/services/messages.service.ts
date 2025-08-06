import { supabase } from "../utils/supabase";
import { LLMRole } from "../types/llm.types";

export async function saveMessage(
  role: LLMRole,
  content: string,
  projectId: string,
  currentStage?: string
  //   workflowStepId: string
) {
  const { error, data } = await supabase
    .from("messages")
    .insert({
      role,
      content,
      project_id: projectId,
      stage: currentStage || null,
      // workflow_step_id: workflowStepId,
    })
    .select("*");
  if (error) {
    console.error("Error saving message", error);
    throw new Error("Failed to save message");
  }
  console.log("Message saved", data);
  return data;
}

export async function getMessages(projectId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.reverse(); // reverse so
}

export async function getStageMessages(
  projectId: string,
  stageKey: string,
  limit = 5
) {
  const { data, error } = await supabase
    .from("messages")
    .select("content")
    .eq("project_id", projectId)
    .eq("stage", stageKey)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching stage messages:", error);
    return [];
  }

  return data.reverse(); // Reverse so oldest is first
}
