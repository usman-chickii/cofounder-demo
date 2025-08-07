import { supabase } from "../utils/supabase";
import { ChatbotStage } from "../types/chatbot.types";
import { STAGES } from "../types/chatbot.types";

export async function getProjectStage(
  projectId: string
): Promise<ChatbotStage | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("current_stage")
    .eq("id", projectId)
    .single();

  if (error) throw new Error(`getProjectStage failed: ${error.message}`);
  return data?.current_stage ?? null;
}

export async function setProjectStage(
  projectId: string,
  stage: ChatbotStage
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ current_stage: stage })
    .eq("id", projectId);

  if (error) throw new Error(`setProjectStage failed: ${error.message}`);
}

export async function getCompletedStages(
  projectId: string
): Promise<ChatbotStage[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("completed_stages")
    .eq("id", projectId)
    .single();

  if (error) throw new Error(`getCompletedStages failed: ${error.message}`);
  return (data?.completed_stages || []) as ChatbotStage[];
}

export async function markStageCompleted(
  projectId: string,
  stage: ChatbotStage
): Promise<void> {
  const completed = await getCompletedStages(projectId);
  if (!completed.includes(stage)) {
    completed.push(stage);
    const { error } = await supabase
      .from("projects")
      .update({ completed_stages: completed })
      .eq("id", projectId);
    if (error) throw new Error(`markStageCompleted failed: ${error.message}`);
  }
}

export function getNextUncompletedStage(
  currentStage?: ChatbotStage,
  completed: ChatbotStage[] = []
): ChatbotStage | null {
  if (!currentStage)
    return STAGES.length > 0 ? (STAGES[0] as ChatbotStage) : null;
  const currentIndex = STAGES.indexOf(currentStage);
  for (let i = currentIndex + 1; i < STAGES.length; i++) {
    const stage = STAGES[i];
    if (stage && !completed.includes(stage)) {
      return stage;
    }
  }
  return null;
}

export function getPreviousUncompletedStage(
  currentStage?: ChatbotStage,
  completed: ChatbotStage[] = []
): ChatbotStage | null {
  if (!currentStage) return null;

  const currentIndex = STAGES.indexOf(currentStage);
  for (let i = currentIndex - 1; i >= 0; i--) {
    const stage = STAGES[i];
    if (stage && !completed.includes(stage)) {
      return stage;
    }
  }
  return null;
}

export async function getProjectMetadata(projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("session_metadata, stage_data")
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error fetching project metadata:", error);
    return { session_metadata: {}, stage_data: {} };
  }

  return {
    session_metadata: data?.session_metadata || {},
    stage_data: data?.stage_data || {},
  };
}

export async function updateProjectMetadata(
  projectId: string,
  stageKey: string,
  globalData: Record<string, any>,
  stageDataInput: Record<string, any>
) {
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("stage_data, session_metadata")
    .eq("id", projectId)
    .single();

  if (fetchError) throw fetchError;

  const stageData = project.stage_data || {};
  const sessionMetadata = project.session_metadata || {};

  // Merge data
  stageData[stageKey] = { ...stageData[stageKey], ...stageDataInput };
  const updatedSessionMeta = { ...sessionMetadata, ...globalData };

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      stage_data: stageData,
      session_metadata: updatedSessionMeta,
    })
    .eq("id", projectId);

  if (updateError) throw updateError;
}
