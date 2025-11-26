import * as vscode from "vscode";

export class LoggerUtility {
  private static shouldLogToConsole: boolean = process.env.LOG_TO_CONSOLE === "true";
  private static shouldShowPopups: boolean = process.env.SHOW_POPUPS === "true";

  static logInfo(message: string): void {
    if (this.shouldLogToConsole) {
      console.log(message);
    }
    if (this.shouldShowPopups) {
      vscode.window.showInformationMessage(message);
    }
  }

  static logWarning(message: string): void {
    if (this.shouldLogToConsole) {
      console.warn(message);
    }
    if (this.shouldShowPopups) {
      vscode.window.showWarningMessage(message);
    }
  }

  static logError(message: string): void {
    if (this.shouldLogToConsole) {
      console.error(message);
    }
    if (this.shouldShowPopups) {
      vscode.window.showErrorMessage(message);
    }
  }
}