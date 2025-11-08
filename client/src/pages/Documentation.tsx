import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Code, Lightbulb, Zap } from "lucide-react";

export default function Documentation() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Learn how to build powerful AI agents
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList>
            <TabsTrigger value="getting-started" data-testid="tab-getting-started">
              <Zap className="h-4 w-4 mr-2" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="concepts" data-testid="tab-concepts">
              <Book className="h-4 w-4 mr-2" />
              Concepts
            </TabsTrigger>
            <TabsTrigger value="examples" data-testid="tab-examples">
              <Code className="h-4 w-4 mr-2" />
              Examples
            </TabsTrigger>
            <TabsTrigger value="best-practices" data-testid="tab-best-practices">
              <Lightbulb className="h-4 w-4 mr-2" />
              Best Practices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>Building Your First Agent</h3>
                <ol>
                  <li>Navigate to the Agent Builder</li>
                  <li>Give your agent a name and description</li>
                  <li>Choose an LLM provider (OpenAI, Anthropic, or Google)</li>
                  <li>Write a system prompt that defines your agent's behavior</li>
                  <li>Add tools if your agent needs to perform actions</li>
                  <li>Test your agent in the Chat Playground</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Requirements</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>To use this platform, you'll need:</p>
                <ul>
                  <li>API keys from at least one LLM provider</li>
                  <li>Basic understanding of AI agents and prompting</li>
                  <li>JavaScript knowledge for custom tool development</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>What is an AI Agent?</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  An AI agent is an autonomous system powered by a Large Language Model (LLM) that can:
                </p>
                <ul>
                  <li><strong>Understand context</strong> - Process user requests and conversation history</li>
                  <li><strong>Make decisions</strong> - Choose appropriate actions based on goals</li>
                  <li><strong>Use tools</strong> - Call functions to interact with external systems</li>
                  <li><strong>Learn from feedback</strong> - Adapt responses based on outcomes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Prompts</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  The system prompt is the foundation of your agent's behavior. It defines:
                </p>
                <ul>
                  <li>The agent's role and personality</li>
                  <li>Knowledge and expertise areas</li>
                  <li>Behavioral guidelines and constraints</li>
                  <li>Response formatting preferences</li>
                </ul>
                <h4>Example:</h4>
                <pre className="bg-muted p-4 rounded-md">
{`You are a helpful customer support agent.
Your role is to assist customers with:
- Product questions
- Order tracking
- Returns and refunds

Always be polite, empathetic, and solution-focused.`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tools & Functions</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Tools extend your agent's capabilities beyond text generation. They allow agents to:
                </p>
                <ul>
                  <li>Search the web for current information</li>
                  <li>Query databases</li>
                  <li>Send emails or notifications</li>
                  <li>Perform calculations</li>
                  <li>Interact with APIs</li>
                </ul>
                <p>
                  Each tool has a name, description, and parameter schema that the LLM uses to decide when and how to call it.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Example: Weather Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
{`function getWeather(location) {
  // Call weather API
  const response = await fetch(
    \`https://api.weather.com/v1/\${location}\`
  );
  const data = await response.json();
  
  return {
    temperature: data.temp,
    conditions: data.conditions,
    humidity: data.humidity
  };
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example: Database Query Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
{`function queryDatabase(query, params) {
  // Validate query to prevent SQL injection
  if (!isSafeQuery(query)) {
    throw new Error("Unsafe query detected");
  }
  
  // Execute query
  const results = db.execute(query, params);
  return results;
}`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="best-practices" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Writing Effective System Prompts</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <ul>
                  <li><strong>Be specific</strong> - Clearly define the agent's role and capabilities</li>
                  <li><strong>Set boundaries</strong> - Specify what the agent should NOT do</li>
                  <li><strong>Include examples</strong> - Show the agent how to format responses</li>
                  <li><strong>Iterate</strong> - Test and refine based on actual conversations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tool Development Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <ul>
                  <li><strong>Keep tools focused</strong> - Each tool should do one thing well</li>
                  <li><strong>Validate inputs</strong> - Always check parameters for safety</li>
                  <li><strong>Handle errors gracefully</strong> - Return helpful error messages</li>
                  <li><strong>Document clearly</strong> - Write descriptions the LLM can understand</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Considerations</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <ul>
                  <li>Never expose API keys in system prompts</li>
                  <li>Validate and sanitize all tool inputs</li>
                  <li>Implement rate limiting for expensive operations</li>
                  <li>Use environment variables for sensitive configuration</li>
                  <li>Test agents thoroughly before production deployment</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
