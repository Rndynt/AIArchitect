import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FileCode, FilePlus, FileEdit, FileX, File } from "lucide-react";

export interface FileOperation {
  path: string;
  operation: "created" | "modified" | "deleted";
  timestamp: number;
  tool: string;
}

interface FileViewerProps {
  files: FileOperation[];
}

function getFileIcon(path: string) {
  const extension = path.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'go':
    case 'rs':
      return <FileCode className="h-4 w-4 text-blue-500" />;
    case 'txt':
    case 'md':
    case 'mdx':
      return <FileText className="h-4 w-4 text-gray-500" />;
    case 'json':
    case 'yaml':
    case 'yml':
    case 'toml':
    case 'xml':
      return <FileText className="h-4 w-4 text-yellow-500" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
}

function getOperationIcon(operation: string) {
  switch (operation) {
    case 'created':
      return <FilePlus className="h-3 w-3" />;
    case 'modified':
      return <FileEdit className="h-3 w-3" />;
    case 'deleted':
      return <FileX className="h-3 w-3" />;
    default:
      return null;
  }
}

function getOperationVariant(operation: string): "default" | "secondary" | "destructive" | "outline" {
  switch (operation) {
    case 'created':
      return "default";
    case 'modified':
      return "secondary";
    case 'deleted':
      return "destructive";
    default:
      return "outline";
  }
}

export function FileViewer({ files }: FileViewerProps) {
  const sortedFiles = [...files].sort((a, b) => b.timestamp - a.timestamp);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Modified Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid="text-no-files">
            No files modified yet
          </p>
        ) : (
          <div className="space-y-2">
            {sortedFiles.map((file, index) => (
              <div
                key={`${file.path}-${file.timestamp}-${index}`}
                className="border rounded-md p-2 hover-elevate"
                data-testid={`file-item-${index}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {getFileIcon(file.path)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono break-all" data-testid={`text-file-path-${index}`}>
                      {file.path}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge 
                        variant={getOperationVariant(file.operation)} 
                        className="text-xs gap-1"
                        data-testid={`badge-operation-${index}`}
                      >
                        {getOperationIcon(file.operation)}
                        {file.operation}
                      </Badge>
                      <Badge variant="outline" className="text-xs" data-testid={`badge-tool-${index}`}>
                        {file.tool}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
