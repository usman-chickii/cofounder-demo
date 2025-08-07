import { supabase } from "../utils/supabase";
import { ChatbotStage } from "../types/chatbot.types";
import { STAGES } from "../types/chatbot.types";
import { ProjectContext } from "../types/projectContext.types";

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

export async function updateProjectContext(
  projectId: string,
  updates: Partial<ProjectContext>
): Promise<void> {
  // Fetch existing context
  const result = await supabase
    .from("projects")
    .select("session_metadata")
    .eq("id", projectId)
    .single();

  if (result.error) {
    throw new Error(
      `Failed to fetch project metadata: ${result.error.message}`
    );
  }

  const existingContext = (result.data?.session_metadata ??
    {}) as ProjectContext;

  // Merge updates
  const updatedContext: ProjectContext = {
    ...existingContext,
    ...updates,
  };

  // Save back to DB
  const { error } = await supabase
    .from("projects")
    .update({ session_metadata: updatedContext })
    .eq("id", projectId);

  if (error) {
    throw new Error(`Failed to update project context: ${error.message}`);
  }
}

export async function getProjectContext(
  projectId: string
): Promise<ProjectContext | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("session_metadata")
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Failed to fetch project context:", error);
    return null;
  }

  return (data?.session_metadata || {}) as ProjectContext;
}
