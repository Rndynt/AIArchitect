import { executeTool } from "./ai/tool-executor";

async function testTools() {
  console.log("\n=== Testing Tool Executors ===\n");

  console.log("1. Testing get_file_structure...");
  const structureResult = await executeTool("get_file_structure", { path: "server/tools" });
  console.log("Result:", JSON.stringify(structureResult, null, 2));

  console.log("\n2. Testing list_files...");
  const listResult = await executeTool("list_files", { directory: "server/ai", recursive: false });
  console.log("Result:", JSON.stringify(listResult, null, 2));

  console.log("\n3. Testing search_codebase...");
  const searchResult = await executeTool("search_codebase", { 
    query: "executeTool",
    file_pattern: "*.ts"
  });
  console.log("Found matches:", searchResult.totalMatches);

  console.log("\n4. Testing bash_command...");
  const bashResult = await executeTool("bash_command", { command: "echo 'Hello from tool executor!'" });
  console.log("Result:", JSON.stringify(bashResult, null, 2));

  console.log("\n5. Testing read_file...");
  const readResult = await executeTool("read_file", { file_path: "package.json" });
  console.log("Success:", readResult.success);
  console.log("Content preview:", readResult.content?.substring(0, 100) + "...");

  console.log("\n=== All Tools Working! ===\n");
}

testTools().catch(console.error);
