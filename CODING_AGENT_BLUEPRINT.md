# Coding AI Agent - Complete Blueprint

## 🎯 Project Goal
Build an AI coding agent similar to Replit Agent that can:
- Read and write files
- Execute bash commands
- Install packages
- Search codebase
- Debug code
- Implement features autonomously
- Handle multi-step coding tasks

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend UI                          │
│  (React + Chat Interface + Code Editor + File Explorer)     │
└─────────────────────────────────────────────────────────────┘
                            ↓ WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    Backend Orchestrator                      │
│  • Manages conversation state                               │
│  • Routes tool calls to executors                           │
│  • Handles streaming responses                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Anthropic Claude API                      │
│  Model: claude-3-5-sonnet-20241022                          │
│  • Receives system prompt + conversation + tools            │
│  • Returns text response + tool calls                       │
│  • Iterates until task complete                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Tool Executors                          │
│  • FileSystemTool (read, write, edit, delete)               │
│  • BashTool (execute commands, install packages)            │
│  • SearchTool (grep, find, search codebase)                 │
│  • AnalysisTool (LSP, lint, test)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Sandbox Environment                       │
│  • Isolated file system                                     │
│  • Node.js/Python runtime                                   │
│  • Git repository                                           │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Core Components

### 1. AI Model Integration (Anthropic Claude)

**Why Claude?**
- Superior coding capabilities
- 200K token context window
- Excellent function calling support
- Better at following complex instructions

**API Integration:**
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Function calling with tools
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  system: systemPrompt, // Very important!
  messages: conversationHistory,
  tools: toolDefinitions, // Array of tool schemas
});
```

### 2. System Prompt Structure

The system prompt is the MOST IMPORTANT part. It defines:
- Agent identity and capabilities
- Coding guidelines and best practices
- When to use which tools
- Error handling strategies
- Response format

**Key Sections:**
```markdown
# System Prompt Structure

## Role Definition
You are an expert software engineer AI agent specialized in...

## Capabilities
You have access to these tools:
1. read_file - Read file contents
2. write_file - Create or overwrite file
3. edit_file - Make precise edits to existing file
4. bash_command - Execute shell commands
5. install_package - Install npm/pip packages
...

## Guidelines
- Always read files before editing
- Use edit_file for modifications, not write_file
- Test code after writing
- Handle errors gracefully
...

## Workflow
1. Understand user request
2. Plan approach
3. Execute step by step
4. Verify results
5. Report to user
```

### 3. Tool/Function Definitions

**Critical Tools (Minimum 15):**

#### File Operations
1. **read_file**
   - Input: `{ file_path: string }`
   - Output: File content as string
   - Error handling: File not found, permission denied

2. **write_file**
   - Input: `{ file_path: string, content: string }`
   - Output: Success confirmation
   - Use: Creating new files only

3. **edit_file**
   - Input: `{ file_path: string, old_string: string, new_string: string }`
   - Output: Updated file content
   - Use: Modifying existing files (preferred over write_file)

4. **delete_file**
   - Input: `{ file_path: string }`
   - Output: Success confirmation

5. **list_files**
   - Input: `{ directory: string, recursive: boolean }`
   - Output: Array of file paths

#### Bash/System Operations
6. **bash_command**
   - Input: `{ command: string, timeout_ms: number }`
   - Output: `{ stdout: string, stderr: string, exit_code: number }`
   - Security: Whitelist allowed commands

7. **install_npm_package**
   - Input: `{ packages: string[], dev: boolean }`
   - Output: Installation logs

8. **install_pip_package**
   - Input: `{ packages: string[] }`
   - Output: Installation logs

#### Code Analysis
9. **search_codebase**
   - Input: `{ query: string, file_pattern?: string }`
   - Output: Relevant code snippets with context
   - Implementation: Use AI-powered semantic search

10. **grep_files**
    - Input: `{ pattern: string, path: string }`
    - Output: Matching lines with file/line numbers

11. **get_file_structure**
    - Input: `{ path: string }`
    - Output: Tree structure of directory

#### Git Operations
12. **git_status**
    - Output: Current git status

13. **git_diff**
    - Output: Uncommitted changes

14. **git_commit**
    - Input: `{ message: string }`
    - Output: Commit hash

#### Testing & Validation
15. **run_tests**
    - Input: `{ test_path?: string }`
    - Output: Test results

16. **lint_code**
    - Input: `{ file_path: string }`
    - Output: Linting errors/warnings

### 4. Tool Schema Format (Anthropic)

```typescript
const toolDefinitions = [
  {
    name: "read_file",
    description: "Read the contents of a file. Use this to examine code before making changes.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to read (e.g., 'src/index.ts')"
        }
      },
      required: ["file_path"]
    }
  },
  {
    name: "edit_file",
    description: "Make precise edits to an existing file by replacing old_string with new_string. Always read the file first to get the exact string to replace.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to edit"
        },
        old_string: {
          type: "string",
          description: "Exact string to find and replace (must match exactly including whitespace)"
        },
        new_string: {
          type: "string",
          description: "New string to replace with"
        }
      },
      required: ["file_path", "old_string", "new_string"]
    }
  },
  {
    name: "bash_command",
    description: "Execute a bash command. Use for running code, installing packages, or system operations.",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The bash command to execute"
        },
        timeout_ms: {
          type: "number",
          description: "Timeout in milliseconds (default: 30000)",
          default: 30000
        }
      },
      required: ["command"]
    }
  }
  // ... more tools
];
```

## 🔄 Execution Loop (The Heart of the Agent)

```typescript
async function executeTask(userMessage: string, conversationHistory: Message[]) {
  // Add user message
  conversationHistory.push({
    role: "user",
    content: userMessage
  });

  let iterations = 0;
  const MAX_ITERATIONS = 50; // Prevent infinite loops

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: conversationHistory,
      tools: toolDefinitions,
    });

    // Add assistant response to history
    conversationHistory.push({
      role: "assistant",
      content: response.content
    });

    // Check if Claude wants to use tools
    const toolUses = response.content.filter(block => block.type === "tool_use");
    
    if (toolUses.length === 0) {
      // No tools needed, task complete
      const textResponse = response.content.find(block => block.type === "text");
      return {
        response: textResponse?.text || "",
        conversationHistory
      };
    }

    // Execute all tool calls
    const toolResults = [];
    for (const toolUse of toolUses) {
      try {
        const result = await executeTool(toolUse.name, toolUse.input);
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result)
        });
      } catch (error) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify({ error: error.message }),
          is_error: true
        });
      }
    }

    // Add tool results to conversation
    conversationHistory.push({
      role: "user",
      content: toolResults
    });

    // Continue loop - Claude will process tool results and decide next action
  }

  throw new Error("Max iterations reached");
}
```

## 🛠️ Tool Executor Implementation

```typescript
import * as fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function executeTool(toolName: string, input: any): Promise<any> {
  switch (toolName) {
    case "read_file":
      return await readFile(input.file_path);
    
    case "write_file":
      return await writeFile(input.file_path, input.content);
    
    case "edit_file":
      return await editFile(input.file_path, input.old_string, input.new_string);
    
    case "bash_command":
      return await bashCommand(input.command, input.timeout_ms);
    
    // ... other tools
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function readFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function writeFile(filePath: string, content: string) {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return { success: true, message: `File written: ${filePath}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function editFile(filePath: string, oldString: string, newString: string) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    
    if (!content.includes(oldString)) {
      return { 
        success: false, 
        error: "old_string not found in file. Read the file first to get exact string." 
      };
    }
    
    const newContent = content.replace(oldString, newString);
    await fs.writeFile(filePath, newContent, "utf-8");
    
    return { 
      success: true, 
      message: `File edited: ${filePath}`,
      preview: newContent.slice(0, 200) 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function bashCommand(command: string, timeoutMs = 30000) {
  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });
    
    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exit_code: 0
    };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout?.trim() || "",
      stderr: error.stderr?.trim() || "",
      exit_code: error.code || 1,
      error: error.message
    };
  }
}
```

## 📡 Backend API Structure

```typescript
// server/routes.ts
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";

export function setupAgentRoutes(app: express.Express) {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  // WebSocket for real-time agent interaction
  wss.on("connection", (ws) => {
    const agentSession = new AgentSession(ws);
    
    ws.on("message", async (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === "user_message") {
        // Stream response to client
        await agentSession.processMessage(message.content);
      }
    });
  });

  // REST API for agent management
  app.post("/api/agent/task", async (req, res) => {
    const { message, sessionId } = req.body;
    const result = await executeTask(message, sessionId);
    res.json(result);
  });

  app.get("/api/agent/sessions", async (req, res) => {
    const sessions = await getAgentSessions();
    res.json(sessions);
  });

  return httpServer;
}

class AgentSession {
  private ws: WebSocket;
  private conversationHistory: Message[] = [];
  
  constructor(ws: WebSocket) {
    this.ws = ws;
  }
  
  async processMessage(userMessage: string) {
    this.conversationHistory.push({
      role: "user",
      content: userMessage
    });
    
    let iterations = 0;
    
    while (iterations < 50) {
      iterations++;
      
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: this.conversationHistory,
        tools: toolDefinitions,
        stream: false // Set to true for streaming
      });
      
      // Send thinking/text to client
      const textContent = response.content.find(b => b.type === "text");
      if (textContent) {
        this.ws.send(JSON.stringify({
          type: "assistant_message",
          content: textContent.text
        }));
      }
      
      // Execute tools
      const toolUses = response.content.filter(b => b.type === "tool_use");
      if (toolUses.length === 0) break;
      
      for (const toolUse of toolUses) {
        // Send tool execution notification
        this.ws.send(JSON.stringify({
          type: "tool_execution",
          tool: toolUse.name,
          input: toolUse.input
        }));
        
        const result = await executeTool(toolUse.name, toolUse.input);
        
        // Send tool result
        this.ws.send(JSON.stringify({
          type: "tool_result",
          tool: toolUse.name,
          result
        }));
        
        // Add to conversation
        this.conversationHistory.push({
          role: "assistant",
          content: response.content
        });
        
        this.conversationHistory.push({
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(result)
          }]
        });
      }
    }
    
    this.ws.send(JSON.stringify({
      type: "task_complete"
    }));
  }
}
```

## 🎨 Frontend Interface

### Chat Interface
```typescript
// client/src/pages/CodingAgent.tsx
import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function CodingAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { sendMessage, lastMessage } = useWebSocket();
  
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      
      if (data.type === "assistant_message") {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.content
        }]);
      } else if (data.type === "tool_execution") {
        setMessages(prev => [...prev, {
          role: "tool",
          tool: data.tool,
          status: "executing",
          input: data.input
        }]);
      } else if (data.type === "tool_result") {
        setMessages(prev => prev.map(msg => 
          msg.tool === data.tool && msg.status === "executing"
            ? { ...msg, status: "complete", result: data.result }
            : msg
        ));
      }
    }
  }, [lastMessage]);
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, {
      role: "user",
      content: input
    }]);
    
    sendMessage(JSON.stringify({
      type: "user_message",
      content: input
    }));
    
    setInput("");
  };
  
  return (
    <div className="flex h-screen">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
        </div>
        
        {/* Input */}
        <div className="p-4 border-t">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the agent to code something..."
            className="w-full min-h-20 resize-none"
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
      
      {/* File Explorer */}
      <FileExplorer />
    </div>
  );
}
```

## 🔐 Security Considerations

1. **Sandbox Isolation**
   - Run code in isolated containers
   - Limit file system access
   - Restrict network access

2. **Command Whitelist**
   - Only allow safe commands
   - Block destructive operations (rm -rf, etc)
   - Validate all paths

3. **Rate Limiting**
   - Limit API calls per user
   - Prevent infinite loops
   - Set execution timeouts

4. **Code Validation**
   - Scan for malicious code
   - Validate file paths
   - Check file sizes

## 📊 Database Schema

```typescript
// Conversation history
interface AgentSession {
  id: string;
  userId: string;
  createdAt: Date;
  messages: Message[];
  projectPath: string;
  status: "active" | "completed" | "error";
}

// Messages
interface Message {
  role: "user" | "assistant" | "tool";
  content: string | ToolCall[];
  timestamp: Date;
  tokens?: number;
}

// Tool execution logs
interface ToolExecution {
  sessionId: string;
  toolName: string;
  input: any;
  output: any;
  duration: number;
  success: boolean;
  timestamp: Date;
}
```

## 🚀 Deployment Considerations

1. **Scalability**
   - Use queue system for long-running tasks
   - Implement worker pool for tool execution
   - Cache frequently accessed files

2. **Monitoring**
   - Track API usage and costs
   - Monitor tool execution times
   - Log errors and failures

3. **Cost Optimization**
   - Use smaller context when possible
   - Cache system prompts
   - Implement smart retries

## 📝 Example Complete System Prompt

```markdown
You are an expert AI coding agent with access to tools for file manipulation, code execution, and system operations.

## Your Capabilities
You can:
- Read and write files in the project
- Execute bash commands
- Install npm/pip packages
- Search through codebases
- Run tests and linters
- Git operations

## Guidelines
1. Always read files before editing them
2. Use edit_file for modifications (not write_file)
3. Test code after writing
4. Provide clear explanations of what you're doing
5. Handle errors gracefully and inform the user

## Workflow
1. Understand the user's request fully
2. Plan your approach step-by-step
3. Use tools to implement the solution
4. Verify your work
5. Summarize what you did

## Tool Usage Best Practices
- read_file: Use before any edits to see current state
- edit_file: Preferred for modifications. Always provide exact old_string
- bash_command: Test installations and run code
- search_codebase: Find relevant code when unsure

## Error Handling
If a tool fails:
1. Read the error message carefully
2. Adjust your approach
3. Try alternative methods
4. Inform user if unable to proceed

You are helpful, precise, and always verify your work before considering a task complete.
```

## ✅ Implementation Checklist

- [ ] Setup Anthropic API integration
- [ ] Implement all core tools (read, write, edit, bash, search)
- [ ] Create system prompt
- [ ] Build execution loop with function calling
- [ ] Setup WebSocket for real-time communication
- [ ] Create chat interface
- [ ] Add file explorer UI
- [ ] Implement code editor with syntax highlighting
- [ ] Add tool execution visualization
- [ ] Setup database for conversation history
- [ ] Implement security measures (sandbox, whitelist)
- [ ] Add error handling and retries
- [ ] Create monitoring and logging
- [ ] Write tests for tool executors
- [ ] Deploy to production environment

## 🎯 Success Criteria

The agent should be able to:
- ✅ Create a new React component from description
- ✅ Debug and fix existing code
- ✅ Install required packages
- ✅ Run tests and interpret results
- ✅ Refactor code following best practices
- ✅ Search codebase for relevant examples
- ✅ Handle multi-step complex tasks
- ✅ Recover from errors gracefully
- ✅ Provide clear explanations of actions

## 📚 References

- Anthropic Claude API: https://docs.anthropic.com/
- Function Calling Guide: https://docs.anthropic.com/en/docs/tool-use
- Similar Projects: Cursor, Aider, Copilot Workspace
