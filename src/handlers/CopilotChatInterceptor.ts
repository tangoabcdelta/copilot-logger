import * as vscode from "vscode";

export class CopilotChatInterceptor {
  private readonly onInteractionDetected: (interaction: string) => void;

  constructor(onInteractionDetected: (interaction: string) => void) {
    this.onInteractionDetected = onInteractionDetected;
  }

  listenForInteractions(context: vscode.ExtensionContext): void {
    const disposable = vscode.workspace.onDidChangeTextDocument((event) =>
      this.handleDocumentChange(event)
    );
    context.subscriptions.push(disposable);
  }

  private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    const editor = vscode.window.activeTextEditor;
    if (
      !editor ||
      event.document.uri.toString() !== editor.document.uri.toString()
    ) {
      return;
    }

    const deltaText = event.contentChanges
      .map((change) => change.text)
      .join("");
    if (!deltaText) {
      return;
    }

    if (!/copilot/i.test(deltaText)) {
      return;
    }

    const snippet = deltaText.trim().replace(/\s+/g, " ").slice(0, 200);
    this.onInteractionDetected(snippet);
  }
}