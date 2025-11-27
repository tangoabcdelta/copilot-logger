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

function initializeChatWebview(context: vscode.ExtensionContext) {
  const chatWebviewProvider = new CopilotChatWebviewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CopilotChatWebviewProvider.viewType,
      chatWebviewProvider
    )
  );
}

function initializeSidebar(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider(
    "copilotLoggerSidebar",
    new CopilotLoggerTreeDataProvider()
  );
}

function initializeLogging(context: vscode.ExtensionContext) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const logDir = workspaceFolder
    ? path.join(workspaceFolder, "logs")
    : path.join(process.env.HOME || process.env.USERPROFILE || "", ".copilot-chats");
  const logFilePath = path.join(logDir, LOG_FILE_NAME);

  if (!workspaceFolder) {
    vscode.window.showWarningMessage(
      "No workspace folder is open. Logging features will use the default location."
    );
  } else {
    const logger = new Logger(logFilePath);
    const outputChannel = vscode.window.createOutputChannel("Copilot Logger");
    context.subscriptions.push(outputChannel);
    const copilotHandler = new CopilotInteractionHandler(logger, outputChannel);
    const scanner = new ChatSessionScanner(logger);

    logger.writeLog("Copilot Logger activated.");
    LoggerUtility.logInfo("Copilot Logger activated.");
    copilotHandler.listenForInteractions(context);

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
  }
}

export function activate(context: vscode.ExtensionContext) {  
  console.log(message);
  vscode.window.showInformationMessage(message);
  LoggerUtility.logInfo("[DEBUG] Activating Copilot Logger extension...");

  // Initialize ChatSessionScanner with a known location for chat storage
  const chatStoragePath = path.join(
    process.env.HOME || process.env.USERPROFILE || "",
    ".copilot-chats"
  );
  LoggerUtility.logInfo(`Created chatStoragePath 17: ${chatStoragePath}`);
  
  const scanner = new ChatSessionScanner(new Logger(chatStoragePath));
  LoggerUtility.logInfo(`ChatSessionScanner initialized line 31: ${scanner}`);

  try {
    scanner.logScannedSessions();
  } catch (err) {
    LoggerUtility.logWarning(
      `Chat session scanner failed: ${err instanceof Error ? err.message : err}`
    );
  }

  // Initialize and scan chat sessions before workspace checks
  const interceptor = new CopilotChatInterceptor((interaction) => {
    LoggerUtility.logInfo(`Intercepted Copilot interaction: ${interaction}`);
  });

  LoggerUtility.logInfo(`listenForInteractions line 21: ${context}`);
  interceptor.listenForInteractions(context);

  LoggerUtility.logInfo(`Workspace-related checks for logging functionality: ${+new Date}`);
  // Workspace-related checks for logging functionality

  if (featureFlags.ENABLE_CHAT_WEBVIEW) {
    initializeChatWebview(context);
  }

  if (featureFlags.ENABLE_SIDEBAR) {
    initializeSidebar(context);
  }

  if (featureFlags.ENABLE_LOGGING) {
    initializeLogging(context);
  }
}

export function deactivate() {
  console.log("[DEBUG] Deactivating Copilot Logger extension...");
}
