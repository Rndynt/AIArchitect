import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_MODEL = "gpt-4-turbo-preview";

export async function createChatCompletion(
  messages: ChatCompletionMessageParam[],
  tools?: ChatCompletionTool[]
) {
  return await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages,
    tools,
    max_tokens: 4096,
    temperature: 0.7,
  });
}
