import * as vscode from "vscode"; // Import the VS Code API for extension development
import * as fs from "fs"; // Import the Node.js file system module for file operations
import * as path from "path"; // Import the Node.js path module for handling file paths
import { Logger } from "./logger/Logger";
import { CopilotInteractionHandler } from "./handlers/CopilotInteractionHandler";
import { ChatSessionScanner } from "./handlers/ChatSessionScanner";
import { CopilotLoggerTreeDataProvider } from "./views/CopilotLoggerTreeDataProvider";
import { CopilotChatInterceptor } from "./handlers/CopilotChatInterceptor";

const LOG_FILE_NAME = "copilot-activity-log.txt"; // Define the name of the log file

export function activate(context: vscode.ExtensionContext) {
  console.log("[DEBUG] Activating Copilot Logger extension...");
  vscode.window.showInformationMessage(
    "[DEBUG] Activating Copilot Logger extension..."
  );

  // Initialize and scan chat sessions before workspace checks
  const interceptor = new CopilotChatInterceptor((interaction) => {
    console.log(`Intercepted Copilot interaction: ${interaction}`);
  });
  interceptor.listenForInteractions(context);

  // Workspace-related checks for logging functionality
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceFolder) {
    vscode.window.showWarningMessage(
      "No workspace folder is open. Logging features will be disabled."
    );
  } else {
    const logDir = path.join(workspaceFolder, "logs");
    const logFilePath = path.join(workspaceFolder, "logs", LOG_FILE_NAME);
    const logger = new Logger(logFilePath);
    const scanner = new ChatSessionScanner(logger);

    try {
      scanner.logScannedSessions();
    } catch (err) {
      console.warn(
        "[WARNING] Chat session scanner failed:",
        err instanceof Error ? err.message : err
      );
      vscode.window.showInformationMessage(
        `[WARNING] Chat session scanner failed: ${
          err instanceof Error ? err.message : err
        }`
      );
    }

    // Create output channel for Copilot interactions (replaces popups)
    const outputChannel = vscode.window.createOutputChannel("Copilot Logger");
    context.subscriptions.push(outputChannel);

    const copilotHandler = new CopilotInteractionHandler(logger, outputChannel);

    logger.writeLog("Copilot Logger activated.");
    vscode.window.showInformationMessage("Copilot Logger activated.");
    copilotHandler.listenForInteractions(context);

    // Command: Create Log Resources
    const createLogResourcesCmd = vscode.commands.registerCommand(
      "copilot-logger.createLogResources",
      async () => {
        try {
          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
            console.log(`[DEBUG] Created logs directory: ${logDir}`);
          }
          if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, "", "utf-8");
            console.log(`[DEBUG] Created log file: ${logFilePath}`);
          }
          vscode.window.showInformationMessage(
            `Log resources created at: ${logDir}`
          );
          // Open the log file in the editor
          const doc = await vscode.workspace.openTextDocument(logFilePath);
          await vscode.window.showTextDocument(doc, { preview: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(
            `Failed to create log resources: ${msg}`
          );
        }
      }
    );
    context.subscriptions.push(createLogResourcesCmd);

    // Command: Import Chat Sessions
    const importChatSessionsCmd = vscode.commands.registerCommand(
      "copilot-logger.importChatSessions",
      () => {
        try {
          scanner.logScannedSessions();
          vscode.window.showInformationMessage(
            "Chat sessions imported successfully."
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(
            `Failed to import chat sessions: ${msg}`
          );
        }
      }
    );
    context.subscriptions.push(importChatSessionsCmd);

    // Register the view provider for the custom view
    vscode.window.registerTreeDataProvider(
      "copilotLoggerView",
      new CopilotLoggerTreeDataProvider()
    );
  }
}

export function deactivate() {
  console.log("[DEBUG] Deactivating Copilot Logger extension...");
}
