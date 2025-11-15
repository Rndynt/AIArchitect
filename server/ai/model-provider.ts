import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { anthropic, CODING_AGENT_MODEL, SYSTEM_PROMPT } from "./anthropic-client";
import { openai, OPENAI_MODEL, OPENAI_MODELS, setOpenAIModel } from "./openai-client";
import { gemini, GEMINI_MODEL, GEMINI_MODELS } from "./gemini-client";
import { setAnthropicModel, ANTHROPIC_MODELS } from "./anthropic-client";
import { toolDefinitions as anthropicTools } from "./tool-definitions";

export type ModelProvider = "anthropic" | "openai" | "gemini";

export interface ProviderMessage {
  role: "user" | "assistant";
  content: string | any[];
}

export interface ProviderToolCall {
  id: string;
  name: string;
  input: any;
}

export interface ProviderResponse {
  content: string;
  toolCalls: ProviderToolCall[];
  stopReason: string;
  rawResponse: any;
}

function convertToolsToOpenAI(anthropicTools: Anthropic.Tool[]): ChatCompletionTool[] {
  return anthropicTools.map(tool => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema
    }
  }));
}

function convertAnthropicMessagesToOpenAI(messages: Anthropic.MessageParam[]): ChatCompletionMessageParam[] {
  const openaiMessages: ChatCompletionMessageParam[] = [];
  
  for (const msg of messages) {
    if (msg.role === "user") {
      if (typeof msg.content === "string") {
        openaiMessages.push({ role: "user" as const, content: msg.content });
      } else {
        // Handle complex user messages with tool_result blocks
        const textBlocks = msg.content.filter((block: any) => block.type === "text");
        const toolResultBlocks = msg.content.filter(
          (block: any): block is Anthropic.ToolResultBlockParam => block.type === "tool_result"
        );
        
        // If there are tool results, add them as separate tool messages
        for (const toolResult of toolResultBlocks) {
          openaiMessages.push({
            role: "tool" as const,
            tool_call_id: toolResult.tool_use_id,
            content: typeof toolResult.content === "string" 
              ? toolResult.content 
              : JSON.stringify(toolResult.content)
          });
        }
        
        // If there's text content, add it as a user message
        if (textBlocks.length > 0) {
          const textContent = textBlocks.map((block: any) => block.text).join("\n");
          openaiMessages.push({ role: "user" as const, content: textContent });
        }
      }
    } else {
      // Assistant message
      if (typeof msg.content === "string") {
        openaiMessages.push({ role: "assistant" as const, content: msg.content });
      } else {
        const textBlocks = msg.content.filter((block: any) => block.type === "text");
        const toolBlocks = msg.content.filter((block: any) => block.type === "tool_use");
        
        const content = textBlocks.map((block: any) => block.text).join("\n") || null;
        const tool_calls = toolBlocks.map((block: any) => ({
          id: block.id,
          type: "function" as const,
          function: {
            name: block.name,
            arguments: JSON.stringify(block.input)
          }
        }));
        
        if (tool_calls.length > 0) {
          openaiMessages.push({
            role: "assistant" as const,
            content,
            tool_calls
          });
        } else {
          openaiMessages.push({ role: "assistant" as const, content: content || "" });
        }
      }
    }
  }
  
  return openaiMessages;
}

function convertToolsToGemini(anthropicTools: Anthropic.Tool[]): any[] {
  return anthropicTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema as any
  }));
}

function convertAnthropicMessagesToGemini(messages: Anthropic.MessageParam[]) {
  const geminiMessages: any[] = [];
  
  for (const msg of messages) {
    if (msg.role === "user") {
      if (typeof msg.content === "string") {
        geminiMessages.push({
          role: "user",
          parts: [{ text: msg.content }]
        });
      } else {
        const textBlocks = msg.content.filter((block: any) => block.type === "text");
        const toolResultBlocks = msg.content.filter(
          (block: any): block is Anthropic.ToolResultBlockParam => block.type === "tool_result"
        );
        
        const parts: any[] = [];
        
        // Add text parts
        for (const textBlock of textBlocks) {
          if ('text' in textBlock) {
            parts.push({ text: textBlock.text });
          }
        }
        
        // Add function response parts
        for (const toolResult of toolResultBlocks) {
          parts.push({
            functionResponse: {
              name: toolResult.tool_use_id,
              response: typeof toolResult.content === "string" 
                ? { result: toolResult.content }
                : toolResult.content
            }
          });
        }
        
        if (parts.length > 0) {
          geminiMessages.push({
            role: "user",
            parts
          });
        }
      }
    } else {
      // Assistant message
      if (typeof msg.content === "string") {
        geminiMessages.push({
          role: "model",
          parts: [{ text: msg.content }]
        });
      } else {
        const textBlocks = msg.content.filter((block: any) => block.type === "text");
        const toolBlocks = msg.content.filter((block: any) => block.type === "tool_use");
        
        const parts: any[] = [];
        
        // Add text parts
        for (const textBlock of textBlocks) {
          if ('text' in textBlock) {
            parts.push({ text: textBlock.text });
          }
        }
        
        // Add function call parts
        for (const toolBlock of toolBlocks) {
          if ('name' in toolBlock && 'input' in toolBlock) {
            parts.push({
              functionCall: {
                name: toolBlock.name,
                args: toolBlock.input
              }
            });
          }
        }
        
        if (parts.length > 0) {
          geminiMessages.push({
            role: "model",
            parts
          });
        }
      }
    }
  }
  
  return geminiMessages;
}

export class ModelProviderService {
  private provider: ModelProvider;
  private modelName?: string;

  constructor(provider: ModelProvider = "anthropic", modelName?: string) {
    this.provider = provider;
    this.modelName = modelName;
    
    if (modelName) {
      if (provider === "openai") {
        setOpenAIModel(modelName);
      } else if (provider === "anthropic") {
        setAnthropicModel(modelName);
      }
    }
  }

  setProvider(provider: ModelProvider, modelName?: string) {
    this.provider = provider;
    this.modelName = modelName;
    
    if (modelName) {
      if (provider === "openai") {
        setOpenAIModel(modelName);
      } else if (provider === "anthropic") {
        setAnthropicModel(modelName);
      }
    }
  }

  async generateResponse(
    messages: Anthropic.MessageParam[]
  ): Promise<ProviderResponse> {
    if (this.provider === "anthropic") {
      return await this.generateAnthropicResponse(messages);
    } else if (this.provider === "openai") {
      return await this.generateOpenAIResponse(messages);
    } else {
      return await this.generateGeminiResponse(messages);
    }
  }

  private async generateAnthropicResponse(
    messages: Anthropic.MessageParam[]
  ): Promise<ProviderResponse> {
    const response = await anthropic.messages.create({
      model: CODING_AGENT_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
      tools: anthropicTools,
    });

    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );
    
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    return {
      content: textBlocks.map(b => b.text).join("\n"),
      toolCalls: toolUseBlocks.map(block => ({
        id: block.id,
        name: block.name,
        input: block.input
      })),
      stopReason: response.stop_reason || "end_turn",
      rawResponse: response
    };
  }

  private async generateOpenAIResponse(
    messages: Anthropic.MessageParam[]
  ): Promise<ProviderResponse> {
    const openaiMessages = convertAnthropicMessagesToOpenAI(messages);
    const openaiTools = convertToolsToOpenAI(anthropicTools);

    openaiMessages.unshift({
      role: "system",
      content: SYSTEM_PROMPT
    });

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: openaiMessages,
      tools: openaiTools,
      max_tokens: 4096,
      temperature: 0.7,
    });

    const choice = response.choices[0];
    const message = choice.message;

    const toolCalls: ProviderToolCall[] = message.tool_calls?.map(tc => {
      if (tc.type === "function") {
        return {
          id: tc.id,
          name: tc.function.name,
          input: JSON.parse(tc.function.arguments)
        };
      }
      return null;
    }).filter((tc): tc is ProviderToolCall => tc !== null) || [];

    return {
      content: message.content || "",
      toolCalls,
      stopReason: choice.finish_reason,
      rawResponse: response
    };
  }

  private async generateGeminiResponse(
    messages: Anthropic.MessageParam[]
  ): Promise<ProviderResponse> {
    const geminiMessages = convertAnthropicMessagesToGemini(messages);
    const geminiTools = convertToolsToGemini(anthropicTools);

    // Build the contents array from all messages
    const contents: any[] = [];
    for (const msg of geminiMessages) {
      contents.push({
        role: msg.role,
        parts: msg.parts
      });
    }

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{
          functionDeclarations: geminiTools
        }]
      }
    });

    const text = response.text || "";
    
    const toolCalls: ProviderToolCall[] = [];
    const functionCalls = response.functionCalls || [];
    
    for (const fc of functionCalls) {
      if (fc.name) {
        toolCalls.push({
          id: `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: fc.name,
          input: fc.args
        });
      }
    }

    return {
      content: text,
      toolCalls,
      stopReason: "STOP",
      rawResponse: response
    };
  }

  getProviderName(): string {
    if (this.provider === "anthropic") {
      return ANTHROPIC_MODELS[CODING_AGENT_MODEL as keyof typeof ANTHROPIC_MODELS] || this.modelName || CODING_AGENT_MODEL;
    } else if (this.provider === "openai") {
      return OPENAI_MODELS[OPENAI_MODEL as keyof typeof OPENAI_MODELS] || this.modelName || OPENAI_MODEL;
    } else {
      return GEMINI_MODELS[GEMINI_MODEL as keyof typeof GEMINI_MODELS] || this.modelName || GEMINI_MODEL;
    }
  }

  getProvider(): ModelProvider {
    return this.provider;
  }
}
