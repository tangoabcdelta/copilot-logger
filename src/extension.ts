// Import necessary modules and libraries
import * as vscode from "vscode"; // Import the VS Code API for extension development
import * as fs from "fs"; // Import the Node.js file system module for file operations
import * as path from "path"; // Import the Node.js path module for handling file paths
import * as dotenv from "dotenv"; // Import dotenv to load environment variables

// Import internal modules
import { Logger } from "./logger/Logger"; // Handles logging functionality
import { CopilotInteractionHandler } from "./handlers/CopilotInteractionHandler"; // Handles Copilot interactions
import { ChatSessionScanner } from "./handlers/ChatSessionScanner"; // Scans and logs chat sessions
import { CopilotLoggerTreeDataProvider } from "./views/CopilotLoggerTreeDataProvider"; // Provides the sidebar view for logs
import { CopilotChatInterceptor } from "./handlers/CopilotChatInterceptor"; // Intercepts Copilot interactions
import { LoggerUtility } from "./utils/LoggerUtility"; // Utility for logging and popups
import { CopilotChatWebviewProvider } from './views/CopilotChatWebviewProvider'; // Provides the chat webview

// Load environment variables from .env file
dotenv.config();
console.log("SHOW_POPUPS:", process.env.SHOW_POPUPS);

// Define constants
const LOG_FILE_NAME = "copilot-activity-log.txt"; // Define the name of the log file
let message = "Hello World"; // Placeholder message for activation

// Feature flag configuration
const featureFlags = {
  ENABLE_CHAT_WEBVIEW: process.env.ENABLE_CHAT_WEBVIEW === 'true', // Enables the chat webview feature
  ENABLE_SIDEBAR: process.env.ENABLE_SIDEBAR === 'true', // Enables the sidebar view for logs
  ENABLE_LOGGING: process.env.ENABLE_LOGGING === 'true', // Enables logging functionality
};

// Refactored to use a design pattern for feature flag-based initialization
class FeatureInitializer {
  constructor(private context: vscode.ExtensionContext) {}

  initialize() {
    // Dynamically initialize features based on active flags
    const initializers = [
      featureFlags.ENABLE_CHAT_WEBVIEW && this.initializeChatWebview,
      featureFlags.ENABLE_SIDEBAR && this.initializeSidebar,
      featureFlags.ENABLE_LOGGING && this.initializeLogging,
    ].filter(Boolean) as (() => void)[];

    initializers.forEach((initializer) => initializer.call(this));
  }

  private initializeChatWebview() {
    // Initialize the chat webview feature
    const chatWebviewProvider = new CopilotChatWebviewProvider(this.context);
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        CopilotChatWebviewProvider.viewType,
        chatWebviewProvider
      )
    );
  }

  private initializeSidebar() {
    // Initialize the sidebar view for logs
    vscode.window.registerTreeDataProvider(
      "copilotLoggerSidebar",
      new CopilotLoggerTreeDataProvider()
    );
  }

  private initializeLogging() {
    // Initialize logging functionality
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const logDir = workspaceFolder
      ? path.join(workspaceFolder, "logs")
      : path.join(process.env.HOME || process.env.USERPROFILE || "", ".copilot-chats");
    const logFilePath = path.join(logDir, LOG_FILE_NAME);

    const logger = new Logger(logFilePath); // Create a logger instance
    const outputChannel = vscode.window.createOutputChannel("Copilot Logger"); // Create an output channel
    this.context.subscriptions.push(outputChannel);
    const copilotHandler = new CopilotInteractionHandler(logger, outputChannel); // Handle Copilot interactions
    const scanner = new ChatSessionScanner(logger); // Scan and log chat sessions

    logger.writeLog("Copilot Logger activated."); // Log activation message
    LoggerUtility.logInfo("Copilot Logger activated.");
    copilotHandler.listenForInteractions(this.context); // Start listening for interactions

    try {
      scanner.logScannedSessions(); // Log scanned chat sessions
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
          scanner.logScannedSessions(); // Log scanned chat sessions
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
  // Activate the extension by initializing features
  const initializer = new FeatureInitializer(context);
  initializer.initialize();

  // Added feature flag check for CopilotChatInterceptor
  if (featureFlags.ENABLE_LOGGING) {
    // Initialize the CopilotChatInterceptor to intercept and log Copilot interactions
    const interceptor = new CopilotChatInterceptor((interaction) => {
      // Log intercepted Copilot interactions for debugging purposes
      LoggerUtility.logInfo(`Intercepted Copilot interaction: ${interaction}`);
    });

    // Start listening for Copilot interactions
    interceptor.listenForInteractions(context);
  }
}

export function deactivate() {
  // Deactivate the extension
  console.log("[DEBUG] Deactivating Copilot Logger extension...");
}
