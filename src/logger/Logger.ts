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

    // Use fallback write directly to avoid dependency on openTextDocument
    this.fallbackWrite(entry);
  }

  private fallbackWrite(entry: string): void {
    try {
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) {
        if (!this.warnedMissingDir) {
          vscode.window.showWarningMessage(
            `Log directory does not exist: ${dir}. Attempting to create it.`
          );
          this.warnedMissingDir = true;
        }
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(this.logFilePath, entry, "utf-8");
    } catch (err) {
      if (!this.warnedMissingFile) {
        vscode.window.showErrorMessage(
          `Failed to write to log file: ${this.logFilePath}. Error: ${err}`
        );
        this.warnedMissingFile = true;
      }
    }
  }

  ensureResources(): boolean {
    if (process.env.ENABLE_LOGGING !== "true") {
      return false; // Skip resource checks if logging is disabled
    }

    const logsDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logsDir)) {
      if (!this.warnedMissingDir) {
        this.warnedMissingDir = true;
        vscode.window.showWarningMessage(
          "Logs directory does not exist. Logging will be disabled until the directory is created."
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