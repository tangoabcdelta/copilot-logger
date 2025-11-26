import * as vscode from "vscode";
import { Logger } from "../logger/Logger";
import { CopilotChatInterceptor } from "./CopilotChatInterceptor";

export class CopilotInteractionHandler {
  private readonly logger: Logger;
  private readonly outputChannel: vscode.OutputChannel;
  private readonly interceptor: CopilotChatInterceptor;
  private static readonly MAX_MESSAGES = 50;

  constructor(logger: Logger, outputChannel: vscode.OutputChannel) {
    this.logger = logger;
    this.outputChannel = outputChannel;
    this.interceptor = new CopilotChatInterceptor((interaction) => {
      this.logger.writeLog(`Detected Copilot interaction: ${interaction}`);
      this.appendToOutputChannel(interaction);
    });
  }

  listenForInteractions(context: vscode.ExtensionContext): void {
    this.interceptor.listenForInteractions(context);
  }

  private appendToOutputChannel(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    this.outputChannel.show(true);
  }
}