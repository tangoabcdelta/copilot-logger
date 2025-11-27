import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export class CopilotChatWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'copilotLogger.chatWebview';

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getWebviewContent();
  }

  private getWebviewContent(): string {
    const appDataPath = process.env.APPDATA || '';
    const chatDir = path.join(appDataPath, 'CopilotChats');
    let chatList = '';

    if (fs.existsSync(chatDir)) {
      const files = fs.readdirSync(chatDir);
      chatList = files
        .map((file) => `<li>${file}</li>`)
        .join('');
    } else {
      chatList = '<li>No chats found</li>';
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Copilot Chats</title>
      </head>
      <body>
        <h1>Past Copilot Chats</h1>
        <ul>
          ${chatList}
        </ul>
      </body>
      </html>
    `;
  }
}