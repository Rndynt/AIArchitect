import { readFile, writeFile, editFile, deleteFile, listFiles, getFileStructure } from "../tools/file-tools";
import { bashCommand, installNpmPackage, installPipPackage } from "../tools/bash-tools";
import { searchCodebase, grepFiles, getFileInfo } from "../tools/search-tools";
import { gitStatus, gitDiff, gitCommit } from "../tools/git-tools";

export async function executeTool(toolName: string, input: any): Promise<any> {
  const startTime = Date.now();
  
  try {
    let result: any;
    
    switch (toolName) {
      case "read_file":
        result = await readFile(input.file_path);
        break;
      
      case "write_file":
        result = await writeFile(input.file_path, input.content);
        break;
      
      case "edit_file":
        result = await editFile(input.file_path, input.old_string, input.new_string);
        break;
      
      case "delete_file":
        result = await deleteFile(input.file_path);
        break;
      
      case "list_files":
        result = await listFiles(input.directory, input.recursive);
        break;
      
      case "get_file_structure":
        result = await getFileStructure(input.path);
        break;
      
      case "bash_command":
        result = await bashCommand(input.command, input.timeout_ms);
        break;
      
      case "install_npm_package":
        result = await installNpmPackage(input.packages, input.dev);
        break;
      
      case "install_pip_package":
        result = await installPipPackage(input.packages);
        break;
      
      case "search_codebase":
        result = await searchCodebase(input.query, input.file_pattern);
        break;
      
      case "grep_files":
        result = await grepFiles(input.pattern, input.path);
        break;
      
      case "get_file_info":
        result = await getFileInfo(input.file_path);
        break;
      
      case "git_status":
        result = await gitStatus();
        break;
      
      case "git_diff":
        result = await gitDiff(input.file_path);
        break;
      
      case "git_commit":
        result = await gitCommit(input.message);
        break;
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[Tool Executor] ${toolName} completed in ${duration}ms`);
    
    return {
      ...result,
      _executionTime: duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Tool Executor] ${toolName} failed after ${duration}ms:`, error.message);
    
    return {
      success: false,
      error: error.message,
      _executionTime: duration
    };
  }
}
