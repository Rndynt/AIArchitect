import type { Anthropic } from "@anthropic-ai/sdk";

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Read the contents of a file. Use this to examine code before making changes. Always read a file before attempting to edit it.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to read (e.g., 'src/index.ts', 'package.json')"
        }
      },
      required: ["file_path"]
    }
  },
  {
    name: "write_file",
    description: "Create a new file or completely overwrite an existing file. Use this only for creating new files. For modifying existing files, prefer edit_file instead.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to write"
        },
        content: {
          type: "string",
          description: "Complete content to write to the file"
        }
      },
      required: ["file_path", "content"]
    }
  },
  {
    name: "edit_file",
    description: "Make precise edits to an existing file by replacing old_string with new_string. This is the preferred way to modify files. Always read the file first to get the exact string to replace. The old_string must match exactly including whitespace.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to edit"
        },
        old_string: {
          type: "string",
          description: "Exact string to find and replace (must match exactly including whitespace and newlines)"
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
    name: "delete_file",
    description: "Delete a file. Use with caution as this operation cannot be undone.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to delete"
        }
      },
      required: ["file_path"]
    }
  },
  {
    name: "list_files",
    description: "List files and directories in a given path. Use this to explore the project structure.",
    input_schema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Directory path to list (default: '.')",
          default: "."
        },
        recursive: {
          type: "boolean",
          description: "Whether to list files recursively",
          default: false
        }
      },
      required: []
    }
  },
  {
    name: "get_file_structure",
    description: "Get a tree-like visualization of the directory structure. Useful for understanding project organization.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to get structure for (default: '.')",
          default: "."
        }
      },
      required: []
    }
  },
  {
    name: "bash_command",
    description: "Execute a bash command. Use for running code, tests, or system operations. Only whitelisted commands are allowed for security.",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The bash command to execute (e.g., 'npm test', 'node index.js')"
        },
        timeout_ms: {
          type: "number",
          description: "Timeout in milliseconds (default: 30000)",
          default: 30000
        }
      },
      required: ["command"]
    }
  },
  {
    name: "install_npm_package",
    description: "Install npm packages. This will run 'npm install' with the specified packages.",
    input_schema: {
      type: "object",
      properties: {
        packages: {
          type: "array",
          items: { type: "string" },
          description: "Array of package names to install (e.g., ['express', 'lodash'])"
        },
        dev: {
          type: "boolean",
          description: "Whether to install as dev dependencies (--save-dev)",
          default: false
        }
      },
      required: ["packages"]
    }
  },
  {
    name: "install_pip_package",
    description: "Install Python packages using pip. This will run 'pip install' with the specified packages.",
    input_schema: {
      type: "object",
      properties: {
        packages: {
          type: "array",
          items: { type: "string" },
          description: "Array of package names to install (e.g., ['requests', 'flask'])"
        }
      },
      required: ["packages"]
    }
  },
  {
    name: "search_codebase",
    description: "Search the entire codebase for a query string. Useful for finding where specific code or text appears in the project.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query string"
        },
        file_pattern: {
          type: "string",
          description: "Optional file pattern to filter results (e.g., '*.ts', '*.tsx')"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "grep_files",
    description: "Search files using regex patterns. More powerful than search_codebase for complex pattern matching.",
    input_schema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "Regex pattern to search for"
        },
        path: {
          type: "string",
          description: "Path to search in (default: '.')",
          default: "."
        }
      },
      required: ["pattern"]
    }
  },
  {
    name: "get_file_info",
    description: "Get metadata about a file including size, modification date, and file type.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file"
        }
      },
      required: ["file_path"]
    }
  }
];
