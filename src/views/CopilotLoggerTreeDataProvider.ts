import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

const LOG_FILE_NAME = "copilot-activity-log.txt";

export class CopilotLoggerTreeDataProvider
  implements vscode.TreeDataProvider<string>
{
  private _onDidChangeTreeData: vscode.EventEmitter<string | undefined | void> =
    new vscode.EventEmitter<string | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<string | undefined | void> =
    this._onDidChangeTreeData.event;

  getTreeItem(element: string): vscode.TreeItem {
    return new vscode.TreeItem(element);
  }

  getChildren(): Thenable<string[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const logFilePath = workspaceFolder
      ? path.join(workspaceFolder, "logs", LOG_FILE_NAME)
      : path.join(
          process.env.HOME || process.env.USERPROFILE || "",
          ".copilot-chats",
          LOG_FILE_NAME
        );

    if (!fs.existsSync(logFilePath)) {
      return Promise.resolve(["No log file found."]);
    }
    const logContent = fs.readFileSync(logFilePath, "utf-8");
    const logLines = logContent.split("\n").filter((line) => line.trim());
    return Promise.resolve(logLines.slice(0, 20));
  }
}