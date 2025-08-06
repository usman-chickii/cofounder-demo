// src/controllers/chat.controller.ts
import { Request, Response } from "express";
import { chatbotGraph } from "../graphs/chatbot.graph";

export async function streamWithIntent(req: Request, res: Response) {
  const { projectId, message } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  let buffer = "";
  console.log("🚀 chatbotGraph invoked:", {
    projectId,
    latestMessage: message,
  });
  await chatbotGraph.invoke({
    projectId,
    latestMessage: message,
    onData: (chunk: string) => {
      buffer += chunk;
      // Send raw chunks instead of "data: chunk"
      res.write(chunk);
    },
  });

  res.end();
}
