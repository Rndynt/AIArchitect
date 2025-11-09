import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const ALLOWED_COMMANDS = [
  'npm', 'node', 'python', 'python3', 'pip', 'pip3',
  'ls', 'cat', 'grep', 'find', 'pwd', 'echo',
  'git', 'curl', 'wget', 'mkdir', 'touch',
  'tsc', 'tsx', 'jest', 'vitest', 'eslint'
];

const DANGEROUS_COMMANDS = [
  'rm -rf', 'rm -fr', 'dd', 'mkfs', 'format',
  '> /dev/', 'chmod 777', 'chown', 'sudo',
  'shutdown', 'reboot', 'init', 'halt'
];

function isCommandAllowed(command: string): { allowed: boolean; reason?: string } {
  const lowerCommand = command.toLowerCase().trim();
  
  for (const dangerous of DANGEROUS_COMMANDS) {
    if (lowerCommand.includes(dangerous)) {
      return { allowed: false, reason: `Dangerous command blocked: ${dangerous}` };
    }
  }
  
  const firstWord = lowerCommand.split(' ')[0].split('/').pop() || '';
  
  const isAllowed = ALLOWED_COMMANDS.some(cmd => 
    firstWord === cmd || firstWord.startsWith(cmd)
  );
  
  if (!isAllowed) {
    return { allowed: false, reason: `Command not in whitelist: ${firstWord}` };
  }
  
  return { allowed: true };
}

export async function bashCommand(command: string, timeoutMs: number = 30000) {
  const commandCheck = isCommandAllowed(command);
  if (!commandCheck.allowed) {
    return {
      success: false,
      stdout: "",
      stderr: commandCheck.reason || "Command not allowed",
      exitCode: 1,
      error: commandCheck.reason
    };
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      cwd: process.cwd()
    });

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      command
    };
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout?.trim() || "",
      stderr: error.stderr?.trim() || error.message,
      exitCode: error.code || 1,
      error: error.message,
      command
    };
  }
}

export async function installNpmPackage(packages: string[], dev: boolean = false) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return {
      success: false,
      error: "No packages specified"
    };
  }

  const packagesStr = packages.join(' ');
  const devFlag = dev ? '--save-dev' : '--save';
  const command = `npm install ${devFlag} ${packagesStr}`;

  try {
    const result = await bashCommand(command, 120000);
    return {
      ...result,
      packages,
      dev,
      message: result.success 
        ? `Successfully installed: ${packagesStr}` 
        : `Failed to install: ${packagesStr}`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      packages,
      dev
    };
  }
}

export async function installPipPackage(packages: string[]) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return {
      success: false,
      error: "No packages specified"
    };
  }

  const packagesStr = packages.join(' ');
  const command = `pip install ${packagesStr}`;

  try {
    const result = await bashCommand(command, 120000);
    return {
      ...result,
      packages,
      message: result.success 
        ? `Successfully installed: ${packagesStr}` 
        : `Failed to install: ${packagesStr}`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      packages
    };
  }
}
