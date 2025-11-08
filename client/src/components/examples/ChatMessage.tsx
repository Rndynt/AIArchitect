import { ChatMessage } from "../ChatMessage";

export default function ChatMessageExample() {
  return (
    <div className="p-8 space-y-4">
      <ChatMessage
        role="user"
        content="Hello! Can you help me with my project?"
      />
      <ChatMessage
        role="assistant"
        content="Of course! I'd be happy to help. What kind of project are you working on?"
      />
      <ChatMessage
        role="tool"
        content=""
        toolName="web_search"
        toolParams={{ query: "AI agent architecture", limit: 5 }}
      />
    </div>
  );
}
