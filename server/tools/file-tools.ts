import * as fs from "fs/promises";
import * as path from "path";

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

export async function readFile(filePath: string) {
  const validation = validatePath(filePath);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const content = await fs.readFile(validation.absolutePath!, "utf-8");
    return { success: true, content, filePath };
  } catch (error: any) {
    return { success: false, error: error.message, filePath };
  }
}

export async function writeFile(filePath: string, content: string) {
  const validation = validatePath(filePath);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const dir = path.dirname(validation.absolutePath!);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(validation.absolutePath!, content, "utf-8");
    return { success: true, message: `File written: ${filePath}`, filePath };
  } catch (error: any) {
    return { success: false, error: error.message, filePath };
  }
}

export async function editFile(filePath: string, oldString: string, newString: string) {
  const validation = validatePath(filePath);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const content = await fs.readFile(validation.absolutePath!, "utf-8");
    
    if (!content.includes(oldString)) {
      return {
        success: false,
        error: "old_string not found in file. Please read the file first to get the exact string to replace.",
        filePath
      };
    }
    
    const newContent = content.replace(oldString, newString);
    await fs.writeFile(validation.absolutePath!, newContent, "utf-8");
    
    return {
      success: true,
      message: `File edited: ${filePath}`,
      filePath,
      preview: newContent.slice(0, 200)
    };
  } catch (error: any) {
    return { success: false, error: error.message, filePath };
  }
}

export async function deleteFile(filePath: string) {
  const validation = validatePath(filePath);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    await fs.unlink(validation.absolutePath!);
    return { success: true, message: `File deleted: ${filePath}`, filePath };
  } catch (error: any) {
    return { success: false, error: error.message, filePath };
  }
}

async function listFilesRecursive(dir: string, baseDir: string, results: string[] = []): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      
      if (entry.isDirectory()) {
        await listFilesRecursive(fullPath, baseDir, results);
      } else {
        results.push(relativePath);
      }
    }
    
    return results;
  } catch (error) {
    return results;
  }
}

export async function listFiles(directory: string = ".", recursive: boolean = false) {
  const validation = validatePath(directory);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const stats = await fs.stat(validation.absolutePath!);
    if (!stats.isDirectory()) {
      return { success: false, error: "Path is not a directory" };
    }

    if (recursive) {
      const files = await listFilesRecursive(validation.absolutePath!, validation.absolutePath!);
      return { success: true, files, directory };
    } else {
      const entries = await fs.readdir(validation.absolutePath!, { withFileTypes: true });
      const files = entries
        .filter(entry => !entry.name.startsWith('.'))
        .map(entry => ({
          name: entry.name,
          type: entry.isDirectory() ? "directory" : "file"
        }));
      return { success: true, files, directory };
    }
  } catch (error: any) {
    return { success: false, error: error.message, directory };
  }
}

async function buildFileTree(dir: string, prefix: string = "", isLast: boolean = true): Promise<string[]> {
  const lines: string[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const filtered = entries.filter(entry => 
      !entry.name.startsWith('.') && entry.name !== 'node_modules'
    );
    
    for (let i = 0; i < filtered.length; i++) {
      const entry = filtered[i];
      const isLastEntry = i === filtered.length - 1;
      const marker = isLastEntry ? "└── " : "├── ";
      
      lines.push(prefix + marker + entry.name);
      
      if (entry.isDirectory()) {
        const newPrefix = prefix + (isLastEntry ? "    " : "│   ");
        const subTree = await buildFileTree(
          path.join(dir, entry.name),
          newPrefix,
          isLastEntry
        );
        lines.push(...subTree);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return lines;
}

export async function getFileStructure(targetPath: string = ".") {
  const validation = validatePath(targetPath);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const stats = await fs.stat(validation.absolutePath!);
    if (!stats.isDirectory()) {
      return { success: false, error: "Path is not a directory" };
    }

    const tree = await buildFileTree(validation.absolutePath!);
    const structure = [targetPath, ...tree].join("\n");
    
    return { success: true, structure, path: targetPath };
  } catch (error: any) {
    return { success: false, error: error.message, path: targetPath };
  }
}
