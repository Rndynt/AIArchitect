import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { anthropic, CODING_AGENT_MODEL, SYSTEM_PROMPT } from "./anthropic-client";
import { openai, OPENAI_MODEL } from "./openai-client";
import { toolDefinitions as anthropicTools } from "./tool-definitions";

export type ModelProvider = "anthropic" | "openai";

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

export class ModelProviderService {
  private provider: ModelProvider;

  constructor(provider: ModelProvider = "anthropic") {
    this.provider = provider;
  }

  setProvider(provider: ModelProvider) {
    this.provider = provider;
  }

  async generateResponse(
    messages: Anthropic.MessageParam[]
  ): Promise<ProviderResponse> {
    if (this.provider === "anthropic") {
      return await this.generateAnthropicResponse(messages);
    } else {
      return await this.generateOpenAIResponse(messages);
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

  getProviderName(): string {
    return this.provider === "anthropic" ? "Claude 3.5 Sonnet" : "GPT-4 Turbo";
  }

  getProvider(): ModelProvider {
    return this.provider;
  }
}
