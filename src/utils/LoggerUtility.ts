import * as vscode from "vscode";

export class LoggerUtility {
  private static shouldLogToConsole: boolean = process.env.LOG_TO_CONSOLE === "true";
  private static shouldShowPopups: boolean = process.env.SHOW_POPUPS === "true";
  private static levels = { error: 0, warn: 1, info: 2 };
  private static logLevel: keyof typeof LoggerUtility.levels = (process.env.LOG_LEVEL as keyof typeof LoggerUtility.levels) || "info";

  private static shouldLog(level: keyof typeof LoggerUtility.levels): boolean {
    return LoggerUtility.levels[level] <= LoggerUtility.levels[this.logLevel];
  }

  static logInfo(message: string): void {
    if (this.shouldLog("info")) {
      if (this.shouldLogToConsole) {
        console.log(message);
      }
      if (this.shouldShowPopups) {
        vscode.window.showInformationMessage(message);
      }
    }
  }

  static logWarning(message: string): void {
    if (this.shouldLog("warn")) {
      if (this.shouldLogToConsole) {
        console.warn(message);
      }
      if (this.shouldShowPopups) {
        vscode.window.showWarningMessage(message);
      }
    }
  }

  static logError(message: string): void {
    if (this.shouldLog("error")) {
      if (this.shouldLogToConsole) {
        console.error(message);
      }
      if (this.shouldShowPopups) {
        vscode.window.showErrorMessage(message);
      }
    }
  }
}