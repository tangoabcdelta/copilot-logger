import * as vscode from "vscode"; // Import the VS Code API for extension development
import * as fs from "fs"; // Import the Node.js file system module for file operations
import * as path from "path"; // Import the Node.js path module for handling file paths
import * as dotenv from "dotenv";

import { Logger } from "./logger/Logger";
import { CopilotInteractionHandler } from "./handlers/CopilotInteractionHandler";
import { ChatSessionScanner } from "./handlers/ChatSessionScanner";
import { CopilotLoggerTreeDataProvider } from "./views/CopilotLoggerTreeDataProvider";
import { CopilotChatInterceptor } from "./handlers/CopilotChatInterceptor";
import { LoggerUtility } from "./utils/LoggerUtility";
import { CopilotChatWebviewProvider } from './views/CopilotChatWebviewProvider';

dotenv.config(); // Load environment variables from .env file
console.log("SHOW_POPUPS:", process.env.SHOW_POPUPS);

const LOG_FILE_NAME = "copilot-activity-log.txt"; // Define the name of the log file
let message = "Hello World";

// Feature flag configuration
const featureFlags = {
  ENABLE_CHAT_WEBVIEW: process.env.ENABLE_CHAT_WEBVIEW === 'true',
  ENABLE_SIDEBAR: process.env.ENABLE_SIDEBAR === 'true',
  ENABLE_LOGGING: process.env.ENABLE_LOGGING === 'true',
};

// Refactored to use a design pattern for feature flag-based initialization
class FeatureInitializer {
  constructor(private context: vscode.ExtensionContext) {}

  initialize() {
    const initializers = [
      featureFlags.ENABLE_CHAT_WEBVIEW && this.initializeChatWebview,
      featureFlags.ENABLE_SIDEBAR && this.initializeSidebar,
      featureFlags.ENABLE_LOGGING && this.initializeLogging,
    ].filter(Boolean) as (() => void)[];

    initializers.forEach((initializer) => initializer.call(this));
  }

  private initializeChatWebview() {
    const chatWebviewProvider = new CopilotChatWebviewProvider(this.context);
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        CopilotChatWebviewProvider.viewType,
        chatWebviewProvider
      )
    );
  }

  private initializeSidebar() {
    vscode.window.registerTreeDataProvider(
      "copilotLoggerSidebar",
      new CopilotLoggerTreeDataProvider()
    );
  }

  private initializeLogging() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const logDir = workspaceFolder
      ? path.join(workspaceFolder, "logs")
      : path.join(process.env.HOME || process.env.USERPROFILE || "", ".copilot-chats");
    const logFilePath = path.join(logDir, LOG_FILE_NAME);

    const logger = new Logger(logFilePath);
    const outputChannel = vscode.window.createOutputChannel("Copilot Logger");
    this.context.subscriptions.push(outputChannel);
    const copilotHandler = new CopilotInteractionHandler(logger, outputChannel);
    const scanner = new ChatSessionScanner(logger);

    logger.writeLog("Copilot Logger activated.");
    LoggerUtility.logInfo("Copilot Logger activated.");
    copilotHandler.listenForInteractions(this.context);

    try {
      scanner.logScannedSessions();
    } catch (err) {
      LoggerUtility.logWarning(
        `Chat session scanner failed: ${err instanceof Error ? err.message : err}`
      );
    }

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
    this.context.subscriptions.push(createLogResourcesCmd);

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
    this.context.subscriptions.push(importChatSessionsCmd);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const initializer = new FeatureInitializer(context);
  initializer.initialize();
}

export function deactivate() {
  console.log("[DEBUG] Deactivating Copilot Logger extension...");
}
