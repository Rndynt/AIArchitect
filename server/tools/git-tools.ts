import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function gitStatus() {
  try {
    const { stdout, stderr } = await execAsync("git status --porcelain", {
      timeout: 10000,
      maxBuffer: 10 * 1024 * 1024,
      cwd: process.cwd()
    });

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      message: stdout.trim() ? "Git status retrieved" : "No changes detected",
      hasChanges: !!stdout.trim()
    };
  } catch (error: any) {
    const isNotGitRepo = error.message?.includes("not a git repository");
    
    return {
      success: false,
      stdout: error.stdout?.trim() || "",
      stderr: error.stderr?.trim() || error.message,
      exitCode: error.code || 1,
      error: isNotGitRepo 
        ? "Not a git repository. Initialize with 'git init' first."
        : error.message,
      isNotGitRepo
    };
  }
}

export async function gitDiff(file_path?: string) {
  const command = file_path 
    ? `git diff -- "${file_path}"` 
    : "git diff";

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
      cwd: process.cwd()
    });

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      message: stdout.trim() 
        ? `Diff retrieved${file_path ? ` for ${file_path}` : ""}` 
        : "No uncommitted changes",
      hasDiff: !!stdout.trim(),
      file_path
    };
  } catch (error: any) {
    const isNotGitRepo = error.message?.includes("not a git repository");
    const fileNotFound = error.message?.includes("does not exist");
    
    return {
      success: false,
      stdout: error.stdout?.trim() || "",
      stderr: error.stderr?.trim() || error.message,
      exitCode: error.code || 1,
      error: isNotGitRepo 
        ? "Not a git repository. Initialize with 'git init' first."
        : fileNotFound
        ? `File not found: ${file_path}`
        : error.message,
      isNotGitRepo,
      file_path
    };
  }
}

export async function gitCommit(message: string) {
  if (!message || message.trim().length === 0) {
    return {
      success: false,
      stdout: "",
      stderr: "Commit message cannot be empty",
      exitCode: 1,
      error: "Commit message is required and cannot be empty"
    };
  }

  if (message.length > 500) {
    return {
      success: false,
      stdout: "",
      stderr: "Commit message too long",
      exitCode: 1,
      error: "Commit message must be 500 characters or less"
    };
  }

  const escapedMessage = message.replace(/"/g, '\\"');
  const command = `git add -A && git commit -m "${escapedMessage}"`;

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
      cwd: process.cwd()
    });

    const commitHash = stdout.match(/\[.*?([a-f0-9]{7})\]/)?.[1] || "";

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      message: `Successfully committed changes${commitHash ? `: ${commitHash}` : ""}`,
      commitHash,
      commitMessage: message
    };
  } catch (error: any) {
    const isNotGitRepo = error.message?.includes("not a git repository");
    const nothingToCommit = error.message?.includes("nothing to commit") || 
                            error.message?.includes("nothing added to commit");
    const noUserConfig = error.message?.includes("user.name") || 
                         error.message?.includes("user.email");
    
    return {
      success: false,
      stdout: error.stdout?.trim() || "",
      stderr: error.stderr?.trim() || error.message,
      exitCode: error.code || 1,
      error: isNotGitRepo 
        ? "Not a git repository. Initialize with 'git init' first."
        : nothingToCommit
        ? "No changes to commit. Use git_status to check repository status."
        : noUserConfig
        ? "Git user not configured. Set user.name and user.email with 'git config' first."
        : error.message,
      isNotGitRepo,
      nothingToCommit,
      commitMessage: message
    };
  }
}
