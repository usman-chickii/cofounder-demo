import { Router } from "express";
import { streamWithIntent } from "../controllers/chat.controller";

const router = Router();

// router.post("/chat", handleChat);
router.post("/chat/stream", streamWithIntent);
// router.get("/chat/stream/", handleChatStreamGet);

export default router;
