import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "../logger/Logger";

export class ChatSessionScanner {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  scan(): string[] {
    const appData = process.env.APPDATA || process.env.XDG_CONFIG_HOME || "";
    if (!appData) {
      vscode.window.showWarningMessage(
        "[WARNING] APPDATA/XDG_CONFIG_HOME not set; skipping chat session scan."
      );
      return [];
    }

    const storageRoot = path.join(appData, "Code", "User", "workspaceStorage");
    if (!fs.existsSync(storageRoot)) {
      vscode.window.showWarningMessage(
        `[WARNING] workspaceStorage not found. Chat scanning will be skipped.`
      );
      return [];
    }

    const results: string[] = [];
    try {
      const workspaceIds = fs.readdirSync(storageRoot);
      workspaceIds.forEach((workspaceId) => {
        const chatDir = path.join(storageRoot, workspaceId, "chatSessions");
        if (!fs.existsSync(chatDir)) {
          return;
        }

        const chatFiles = fs.readdirSync(chatDir);
        chatFiles.forEach((chatFile) => {
          const chatFilePath = path.join(chatDir, chatFile);
          try {
            const raw = fs.readFileSync(chatFilePath, "utf-8");
            results.push(raw);
          } catch (err) {
            vscode.window.showWarningMessage(
              `[WARNING] Failed to read chat session ${chatFilePath}: ${err}`
            );
          }
        });
      });
    } catch (err) {
      vscode.window.showWarningMessage(
        `[WARNING] Error scanning workspaceStorage: ${err}`
      );
    }

    return results;
  }

  logScannedSessions(): void {
    const sessions = this.scan();
    sessions.forEach((session) => {
      this.logger.writeLog(session);
    });
  }
}