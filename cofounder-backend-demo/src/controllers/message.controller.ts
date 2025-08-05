// controllers/messages.controller.ts
import { Request, Response } from "express";
import { getMessages } from "../services/messages.service";

export const handleGetMessages = async (req: Request, res: Response) => {
  try {
    const { projectId, limit } = req.query;

    if (!projectId || typeof projectId !== "string") {
      return res.status(400).json({ error: "Invalid or missing projectId" });
    }

    const num = limit ? parseInt(limit as string, 10) : 10; // default 10 messages
    const messages = await getMessages(projectId, num);

    return res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};
