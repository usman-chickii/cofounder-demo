import { ChatGroq } from "@langchain/groq";
import { ENV } from "../config/env";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGroq({
  model: "llama3-8b-8192",
  apiKey: ENV.GROQ_API_KEY as string,
  streaming: true,
});

export const basicChatChain = (systemPrompt: string) => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["user", "{input}"],
  ]);

  return prompt.pipe(model).pipe(new StringOutputParser());
};
    