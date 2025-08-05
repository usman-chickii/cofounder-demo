import { Router } from "express";
import { handleGetMessages } from "../controllers/message.controller";

const router = Router();

router.get("/messages", handleGetMessages);

export default router;
