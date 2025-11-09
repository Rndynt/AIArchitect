import Anthropic from "@anthropic-ai/sdk";
import { anthropic, CODING_AGENT_MODEL, SYSTEM_PROMPT } from "./anthropic-client";
import { toolDefinitions } from "./tool-definitions";
import { executeTool } from "./tool-executor";
import { storage } from "../storage";

export interface AgentEvent {
  type: "thinking" | "tool_use" | "tool_result" | "response" | "complete" | "error";
  content?: string;
  tool?: string;
  input?: any;
  result?: any;
  error?: string;
}

export class CodingAgent {
  private sessionId: string;
  private conversationHistory: Anthropic.MessageParam[];
  private maxIterations: number = 50;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.conversationHistory = [];
  }

  async *processMessage(userMessage: string): AsyncIterableIterator<AgentEvent> {
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
      console.log(`[Agent] Iteration ${iterations}/${this.maxIterations}`);

      try {
        const response = await anthropic.messages.create({
          model: CODING_AGENT_MODEL,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: this.conversationHistory,
          tools: toolDefinitions,
        });

        console.log(`[Agent] Response stop_reason: ${response.stop_reason}`);

        const textBlocks = response.content.filter(
          (block): block is Anthropic.TextBlock => block.type === "text"
        );
        
        for (const textBlock of textBlocks) {
          if (textBlock.text.trim()) {
            yield {
              type: "thinking",
              content: textBlock.text
            };
          }
        }

        const toolUseBlocks = response.content.filter(
          (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
        );

        if (toolUseBlocks.length === 0) {
          await storage.addMessage({
            sessionId: this.sessionId,
            role: "assistant",
            content: response.content.map(b => 
              b.type === "text" ? b.text : JSON.stringify(b)
            ).join("\n")
          });

          const finalText = textBlocks.map(b => b.text).join("\n");
          if (finalText.trim()) {
            yield {
              type: "response",
              content: finalText
            };
          }

          yield { type: "complete" };
          break;
        }

        this.conversationHistory.push({
          role: "assistant",
          content: response.content
        });

        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolUse of toolUseBlocks) {
          yield {
            type: "tool_use",
            tool: toolUse.name,
            input: toolUse.input
          };

          const startTime = Date.now();
          let result: any;
          let success = true;

          try {
            result = await executeTool(toolUse.name, toolUse.input);
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
            toolName: toolUse.name,
            input: toolUse.input as any,
            output: result as any,
            duration,
            success
          });

          yield {
            type: "tool_result",
            tool: toolUse.name,
            result
          };

          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
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
