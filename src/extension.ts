// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Logger class to handle logging responsibilities
class Logger {
	private logFilePath: string;

	constructor(logFilePath: string) {
		this.logFilePath = logFilePath;
	}

	ensureLogFile(): boolean {
		const logsDir = path.dirname(this.logFilePath);
		if (!fs.existsSync(logsDir)) {
			vscode.window.showWarningMessage('Logs directory does not exist. Please create the logs directory manually.');
			console.warn('[WARNING] Logs directory does not exist.');
			return false;
		}

		if (!fs.existsSync(this.logFilePath)) {
			vscode.window.showWarningMessage('Log file does not exist. Please create the log file manually.');
			console.warn('[WARNING] Log file does not exist.');
			return false;
		}

		return true;
	}

	writeLog(content: string): void {
		if (!this.ensureLogFile()) {
			return;
		}

		try {
			const existingContent = fs.readFileSync(this.logFilePath, 'utf-8');
			const timestamp = new Date().toISOString();
			const newContent = `[${timestamp}] ${content}\n` + existingContent;
			fs.writeFileSync(this.logFilePath, newContent, 'utf-8');
			console.log(`[DEBUG] Log written to: ${this.logFilePath}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`[ERROR] Failed to write to log file: ${errorMessage}`);
			vscode.window.showErrorMessage(`Failed to write to log file: ${errorMessage}.`);
		}
	}
}

// CopilotInteractionHandler class to handle Copilot-related events
class CopilotInteractionHandler {
	private logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	listenForInteractions(): void {
		vscode.workspace.onDidChangeTextDocument((event) => {
			const editor = vscode.window.activeTextEditor;
			if (editor && event.document.uri.toString() === editor.document.uri.toString()) {
				const content = editor.document.getText();
				if (content.includes('copilot')) { // Example condition to detect Copilot-related text
					const logContent = `Copilot interaction detected: ${content}`;
					this.logger.writeLog(logContent);
				}
			}
		});
	}
}

// Extension activation function
export function activate(context: vscode.ExtensionContext) {
	console.log('[DEBUG] Activating Copilot Logger extension...');

	const logFilePath = path.join(__dirname, 'logs', 'copilot-activity-log.txt');
	const logger = new Logger(logFilePath);
	const copilotHandler = new CopilotInteractionHandler(logger);

	logger.writeLog('Copilot Logger activated.');
	copilotHandler.listenForInteractions();

	console.log('[DEBUG] Copilot Logger extension activated.');
}

// Extension deactivation function
export function deactivate() {
	console.log('[DEBUG] Deactivating Copilot Logger extension...');
}
