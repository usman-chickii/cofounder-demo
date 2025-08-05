import { supabase } from "../utils/supabase";
import { ChatbotStage } from "../types/chatbot.types";

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
