import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.MEGALLM_API_KEY || "" 
});

export const GEMINI_MODELS = {
  "gemini-2.0-flash-exp": "Gemini 2.0 Flash",
  "gemini-1.5-pro": "Gemini 1.5 Pro",
  "gemini-1.5-flash": "Gemini 1.5 Flash"
} as const;

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";

export async function generateGeminiContent(params: any) {
  return await gemini.models.generateContent({
    model: GEMINI_MODEL,
    ...params
  });
}
