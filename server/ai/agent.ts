import Anthropic from "@anthropic-ai/sdk";
import { executeTool } from "./tool-executor";
import { storage } from "../storage";
import { ModelProviderService, ModelProvider } from "./model-provider";

export interface AgentEvent {
  type: "thinking" | "tool_use" | "tool_result" | "response" | "complete" | "error" | "model_info";
  content?: string;
  tool?: string;
  input?: any;
  result?: any;
  error?: string;
  modelProvider?: string;
  modelName?: string;
}

export class CodingAgent {
  private sessionId: string;
  private conversationHistory: Anthropic.MessageParam[];
  private maxIterations: number = 50;
  private modelProvider: ModelProviderService;

  constructor(sessionId: string, provider: ModelProvider = "anthropic", modelName?: string) {
    this.sessionId = sessionId;
    this.conversationHistory = [];
    this.modelProvider = new ModelProviderService(provider, modelName);
  }

  setModelProvider(provider: ModelProvider, modelName?: string) {
    this.modelProvider.setProvider(provider, modelName);
  }

  getModelInfo() {
    return {
      provider: this.modelProvider.getProvider(),
      name: this.modelProvider.getProviderName()
    };
  }

  async *processMessage(userMessage: string): AsyncIterableIterator<AgentEvent> {
    // Send model info at start
    const modelInfo = this.getModelInfo();
    yield {
      type: "model_info",
      modelProvider: modelInfo.provider,
      modelName: modelInfo.name
    };

    await storage.addMessage({
      sessionId: this.sessionId,
      role: "user",
      content: userMessage
    });

    this.conversationHistory.push({
      role: "user",
      content: userMessage
    });

    let iterations = 0;

    while (iterations < this.maxIterations) {
      iterations++;
      console.log(`[Agent] Iteration ${iterations}/${this.maxIterations} using ${modelInfo.name}`);

      try {
        const response = await this.modelProvider.generateResponse(this.conversationHistory);

        console.log(`[Agent] Response stop_reason: ${response.stopReason}`);

        if (response.content.trim()) {
          yield {
            type: "thinking",
            content: response.content
          };
        }

        if (response.toolCalls.length === 0) {
          await storage.addMessage({
            sessionId: this.sessionId,
            role: "assistant",
            content: response.content
          });

          if (response.content.trim()) {
            yield {
              type: "response",
              content: response.content
            };
          }

          yield { type: "complete" };
          break;
        }

        // Store assistant message with tool calls in Anthropic format
        if (this.modelProvider.getProvider() === "anthropic") {
          // For Anthropic, use the raw response content
          this.conversationHistory.push({
            role: "assistant",
            content: response.rawResponse.content
          });
        } else {
          // For OpenAI, convert to Anthropic-compatible format
          const contentBlocks: (Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam)[] = [];
          
          // Add text content if present
          if (response.content) {
            contentBlocks.push({
              type: "text",
              text: response.content
            });
          }
          
          // Add tool use blocks
          for (const toolCall of response.toolCalls) {
            contentBlocks.push({
              type: "tool_use",
              id: toolCall.id,
              name: toolCall.name,
              input: toolCall.input
            });
          }
          
          this.conversationHistory.push({
            role: "assistant",
            content: contentBlocks
          });
        }

        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolCall of response.toolCalls) {
          yield {
            type: "tool_use",
            tool: toolCall.name,
            input: toolCall.input
          };

          const startTime = Date.now();
          let result: any;
          let success = true;

          try {
            result = await executeTool(toolCall.name, toolCall.input);
            success = result.success !== false;
          } catch (error: any) {
            result = {
              success: false,
              error: error.message
            };
            success = false;
          }

          const duration = Date.now() - startTime;

          await storage.logToolExecution({
            sessionId: this.sessionId,
            toolName: toolCall.name,
            input: toolCall.input as any,
            output: result as any,
            duration,
            success
          });

          yield {
            type: "tool_result",
            tool: toolCall.name,
            result
          };

          toolResults.push({
            type: "tool_result",
            tool_use_id: toolCall.id,
            content: JSON.stringify(result)
          });
        }

        this.conversationHistory.push({
          role: "user",
          content: toolResults
        });

      } catch (error: any) {
        console.error(`[Agent] Error in iteration ${iterations}:`, error);
        
        yield {
          type: "error",
          error: error.message || "An error occurred during processing"
        };

        await storage.updateSession(this.sessionId, { status: "error" });
        break;
      }
    }

    if (iterations >= this.maxIterations) {
      console.warn(`[Agent] Max iterations (${this.maxIterations}) reached`);
      yield {
        type: "error",
        error: "Maximum iterations reached. The task may be too complex or the agent is stuck in a loop."
      };
    }

    await storage.updateSession(this.sessionId, { status: "completed" });
  }

  getConversationHistory(): Anthropic.MessageParam[] {
    return this.conversationHistory;
  }

  async loadFromSession() {
    const messages = await storage.getMessages(this.sessionId);
    
    this.conversationHistory = [];
    
    for (const msg of messages) {
      if (msg.role === "user" || msg.role === "assistant") {
        this.conversationHistory.push({
          role: msg.role as "user" | "assistant",
          content: msg.content
        });
      }
    }
  }
}
