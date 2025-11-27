import * as vscode from "vscode";

export class LoggerUtility {
  private static shouldLogToConsole: boolean = process.env.LOG_TO_CONSOLE === "true";
  private static shouldShowPopups: boolean = process.env.SHOW_POPUPS === "true";
  private static levels = { error: 0, warn: 1, info: 2 };
  private static logLevel: keyof typeof LoggerUtility.levels = (process.env.LOG_LEVEL as keyof typeof LoggerUtility.levels) || "info";

  private static debounceTimer: NodeJS.Timeout | null = null;
  private static debouncedMessages: string[] = [];

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

  // TODO: Implement a debounced popup mechanism
  // This mechanism should aggregate multiple log messages within a short time window (e.g., 2 seconds)
  // and display a single popup notification to avoid excessive notifications.

  // Example (pseudo-code):
  // private static debounceTimer: NodeJS.Timeout | null = null;
  // private static debouncedMessages: string[] = [];
  // static logDebouncedInfo(message: string): void {
  //   this.debouncedMessages.push(message);
  //   if (this.debounceTimer) {
  //     clearTimeout(this.debounceTimer);
  //   }
  //   this.debounceTimer = setTimeout(() => {
  //     const aggregatedMessage = this.debouncedMessages.join("\n");
  //     this.debouncedMessages = [];
  //     vscode.window.showInformationMessage(aggregatedMessage);
  //   }, 2000);
  // }
}