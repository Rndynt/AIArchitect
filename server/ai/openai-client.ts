import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

export const openai = new OpenAI({
  apiKey: process.env.MEGALLM_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.MEGALLM_API_KEY ? "https://ai.megallm.io/v1" : undefined,
});

export const OPENAI_MODELS = {
  "gpt-5.1": "GPT-5.1",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-4": "GPT-4",
  "llama3-8b-instruct": "Llama 3 8B Instruct",
  "qwen/qwen3-next-80b-a3b-instruct": "Qwen3 Next 80B",
  "deepseek-ai/deepseek-v3.1": "DeepSeek v3.1",
  "deepseek-ai/deepseek-v3.1-terminus": "DeepSeek v3.1 Terminus",
  "moonshotai/kimi-k2-instruct-0905": "Kimi K2 Instruct",
  "text-embedding-3-small": "Text Embedding 3 Small"
} as const;

export let OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export function setOpenAIModel(model: string) {
  OPENAI_MODEL = model;
}

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
