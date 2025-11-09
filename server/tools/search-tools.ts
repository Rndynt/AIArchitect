import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);
const PROJECT_ROOT = process.cwd();

function validatePath(filePath: string): { valid: boolean; error?: string; absolutePath?: string } {
  try {
    const absolutePath = path.resolve(PROJECT_ROOT, filePath);
    
    if (!absolutePath.startsWith(PROJECT_ROOT)) {
      return { valid: false, error: "Access denied: Path outside project directory" };
    }
    
    return { valid: true, absolutePath };
  } catch (error) {
    return { valid: false, error: `Invalid path: ${error}` };
  }
}

export async function searchCodebase(query: string, filePattern?: string) {
  try {
    const grepPattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    let command = `grep -r -n -i "${grepPattern}" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build`;
    
    if (filePattern) {
      command += ` --include="${filePattern}"`;
    }
    
    command += ` . || true`;

    const { stdout } = await execAsync(command, {
      cwd: PROJECT_ROOT,
      maxBuffer: 10 * 1024 * 1024
    });

    if (!stdout.trim()) {
      return {
        success: true,
        results: [],
        query,
        message: "No matches found"
      };
    }

    const lines = stdout.trim().split('\n');
    const results = lines.slice(0, 100).map(line => {
      const match = line.match(/^([^:]+):(\d+):(.+)$/);
      if (match) {
        return {
          file: match[1].replace(/^\.\//, ''),
          line: parseInt(match[2]),
          content: match[3].trim()
        };
      }
      return null;
    }).filter(Boolean);

    return {
      success: true,
      results,
      query,
      filePattern,
      totalMatches: results.length,
      message: `Found ${results.length} matches`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      query,
      filePattern
    };
  }
}

export async function grepFiles(pattern: string, targetPath: string = ".") {
  const validation = validatePath(targetPath);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const escapedPattern = pattern.replace(/"/g, '\\"');
    const command = `grep -r -n -E "${escapedPattern}" "${validation.absolutePath}" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build || true`;

    const { stdout } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024
    });

    if (!stdout.trim()) {
      return {
        success: true,
        results: [],
        pattern,
        path: targetPath,
        message: "No matches found"
      };
    }

    const lines = stdout.trim().split('\n');
    const results = lines.slice(0, 100).map(line => {
      const match = line.match(/^([^:]+):(\d+):(.+)$/);
      if (match) {
        return {
          file: path.relative(PROJECT_ROOT, match[1]),
          line: parseInt(match[2]),
          content: match[3].trim()
        };
      }
      return null;
    }).filter(Boolean);

    return {
      success: true,
      results,
      pattern,
      path: targetPath,
      totalMatches: results.length
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      pattern,
      path: targetPath
    };
  }
}

export async function getFileInfo(filePath: string) {
  const validation = validatePath(filePath);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const stats = await fs.stat(validation.absolutePath!);
    
    return {
      success: true,
      filePath,
      size: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      filePath
    };
  }
}
