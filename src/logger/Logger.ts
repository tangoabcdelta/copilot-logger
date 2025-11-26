import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

const LOG_FILE_NAME = "copilot-activity-log.txt";

export class Logger {
  private readonly logFilePath: string;
  private warnedMissingDir = false;
  private warnedMissingFile = false;

  constructor(logFilePath: string) {
    this.logFilePath = logFilePath;
  }

  writeLog(content: string): void {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${content}\n\n`;

    vscode.workspace.openTextDocument(this.logFilePath).then(
      (doc) => {
        vscode.window.showTextDocument(doc, { preview: false }).then(
          (editor) => {
            editor.edit((editBuilder) => {
              editBuilder.insert(new vscode.Position(0, 0), entry);
            });
          },
          (showErr) => {
            this.fallbackWrite(entry);
          }
        );
      },
      (openErr) => {
        this.fallbackWrite(entry);
      }
    );
  }

  private fallbackWrite(entry: string): void {
    try {
      const existingContent = fs.existsSync(this.logFilePath)
        ? fs.readFileSync(this.logFilePath, "utf-8")
        : "";
      fs.writeFileSync(this.logFilePath, entry + existingContent, "utf-8");
    } catch (fsErr) {
      vscode.window.showErrorMessage(
        `[ERROR] Failed to write to log file: ${fsErr}`
      );
    }
  }

  ensureResources(): boolean {
    const logsDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logsDir)) {
      if (!this.warnedMissingDir) {
        this.warnedMissingDir = true;
        vscode.window.showWarningMessage(
          "Logs directory does not exist. Please create a `logs/` folder in your workspace."
        );
      }
      return false;
    }

    if (!fs.existsSync(this.logFilePath)) {
      if (!this.warnedMissingFile) {
        this.warnedMissingFile = true;
        vscode.window.showWarningMessage(
          `Log file ${LOG_FILE_NAME} is missing. Create the file inside logs/ to enable logging.`
        );
      }
      return false;
    }

    return true;
  }
}