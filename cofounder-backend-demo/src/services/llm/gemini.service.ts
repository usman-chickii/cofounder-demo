// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ENV } from "../../config/env";
// import { LLMMessage } from "../../types/llm.types";
// import {
//   SystemMessage,
//   HumanMessage,
//   AIMessage,
// } from "@langchain/core/messages";

// const gemini = new ChatGoogleGenerativeAI({
//   apiKey: ENV.GEMINI_API_KEY!,
//   model: "gemini-2.0-flash",
// });

// // Convert our LLMMessage to LangChain BaseMessageLike[]
// function toLangChainMessages(messages: LLMMessage[]) {
//   // For Gemini, we need to handle system messages carefully
//   // Combine all system messages into one, then add conversation
//   const systemMessages = messages.filter((msg) => msg.role === "system");
//   const nonSystemMessages = messages.filter((msg) => msg.role !== "system");

//   // Combine all system messages into one
//   const combinedSystemContent = systemMessages
//     .map((msg) => msg.content)
//     .join("\n\n");

//   const result = [];

//   // Add combined system message first (if any)
//   if (combinedSystemContent.trim()) {
//     result.push(new SystemMessage(combinedSystemContent));
//   }

//   // Add all non-system messages
//   for (const msg of nonSystemMessages) {
//     // Skip empty messages
//     if (!msg.content || msg.content.trim() === "") {
//       continue;
//     }

//     switch (msg.role) {
//       case "user":
//         result.push(new HumanMessage(msg.content));
//         break;
//       case "assistant":
//         result.push(new AIMessage(msg.content));
//         break;
//       default:
//         throw new Error(`Unsupported role: ${msg.role}`);
//     }
//   }

//   // Ensure we have at least one message
//   if (result.length === 0) {
//     // Fallback: create a minimal system message
//     result.push(new SystemMessage("You are a helpful AI assistant."));
//   }

//   return result;
// }
// export const askGemini = async (messages: LLMMessage[]) => {
//   try {
//     const lcMessages = toLangChainMessages(messages);

//     if (lcMessages.length === 0) {
//       throw new Error("No valid messages to send to Gemini");
//     }

//     const response = await gemini.invoke(lcMessages);
//     return response?.content?.toString() ?? "";
//   } catch (error) {
//     console.error("Gemini invoke error:", error);
//     throw error;
//   }
// };

// export const streamGemini = async (
//   messages: LLMMessage[],
//   onData: (chunk: string) => void
// ) => {
//   try {
//     const lcMessages = toLangChainMessages(messages);

//     if (lcMessages.length === 0) {
//       throw new Error("No valid messages to send to Gemini");
//     }

//     const stream = await gemini.stream(lcMessages);
//     for await (const chunk of stream) {
//       if (chunk?.content) {
//         onData(chunk.content.toString());
//       }
//     }
//   } catch (error) {
//     console.error("Gemini streaming error:", error);
//     // Provide a fallback response
//     onData(
//       "I apologize, but I encountered an error while processing your request. Please try again."
//     );
//     throw error;
//   }
// };
