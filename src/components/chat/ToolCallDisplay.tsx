"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  state: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

export function describeToolCall(tool: ToolInvocation): string {
  const args = tool.args || {};
  const path = args.path as string | undefined;
  const fileName = path ? getFileName(path) : undefined;

  if (tool.toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    switch (command) {
      case "create":
        return fileName ? `Created ${fileName}` : "Created a file";
      case "str_replace":
        return fileName ? `Edited ${fileName}` : "Edited a file";
      case "insert":
        return fileName ? `Edited ${fileName}` : "Edited a file";
      case "view":
        return fileName ? `Viewing ${fileName}` : "Viewing a file";
      default:
        return fileName ? `Modified ${fileName}` : "Modified a file";
    }
  }

  if (tool.toolName === "file_manager") {
    const command = args.command as string | undefined;
    const newPath = args.new_path as string | undefined;
    switch (command) {
      case "rename": {
        const newName = newPath ? getFileName(newPath) : undefined;
        if (fileName && newName) return `Renamed ${fileName} → ${newName}`;
        return "Renamed a file";
      }
      case "delete":
        return fileName ? `Deleted ${fileName}` : "Deleted a file";
      default:
        return fileName ? `Modified ${fileName}` : "Modified a file";
    }
  }

  return tool.toolName;
}

export function ToolCallDisplay({ tool }: { tool: ToolInvocation }) {
  const isComplete = tool.state === "result" && tool.result;
  const label = describeToolCall(tool);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
