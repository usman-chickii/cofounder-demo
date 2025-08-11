import { supabase } from "../utils/supabase";
import { ChatbotStage } from "../types/chatbot.types";
import { ProjectContext } from "../types/projectContext.types";
// import { deepMergeProjectContext } from "../utils/projectContext.util";

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

export async function updateProjectContext(
  projectId: string,
  stage: ChatbotStage,
  updates: Partial<ProjectContext>
): Promise<void> {
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

  // Extract only the metadata for the current stage from updates
  const stageUpdate = updates[stage as keyof ProjectContext];

  if (!stageUpdate) {
    // Nothing to update for this stage
    return;
  }

  // Prepare new context with only the current stage updated
  const updatedContext: ProjectContext = {
    ...existingContext,
    [stage]: {
      ...existingContext[stage as keyof ProjectContext],
      ...stageUpdate,
    },
  };
  console.log("updatedContext", updatedContext);

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
