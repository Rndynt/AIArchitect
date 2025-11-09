import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_MODELS = {
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-4": "GPT-4"
} as const;

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

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
