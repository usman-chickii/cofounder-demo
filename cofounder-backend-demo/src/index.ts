import express from "express";
import { ENV } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";

import chatRouter from "./routes/chat.routes";
import messageRouter from "./routes/message.routes";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/", chatRouter);
app.use("/api/", messageRouter);
app.use(errorHandler);
app.listen(ENV.PORT, () => {
  console.log("Server is running on port 3000");
});
