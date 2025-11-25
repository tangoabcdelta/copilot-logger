// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('[DEBUG] Activating Copilot Logger extension...');

	// Create a logs directory in the workspace
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders && workspaceFolders.length > 0) {
		const logsDir = path.join(workspaceFolders[0].uri.fsPath, 'logs');
		if (!fs.existsSync(logsDir)) {
			fs.mkdirSync(logsDir);
			console.log(`[DEBUG] Created logs directory at: ${logsDir}`);
		}

		// Write a log file
		const logFile = path.join(logsDir, `log-${new Date().toISOString()}.txt`);
		fs.writeFileSync(logFile, 'Copilot Logger activated.\n', { flag: 'a' });
		console.log(`[DEBUG] Log file created: ${logFile}`);
	} else {
		console.error('[ERROR] No workspace folder found. Logs cannot be created.');
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('copilot-logger.helloWorld', () => {
		console.log('[DEBUG] Hello World command executed.');
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Copilot Logger!');
	});

	context.subscriptions.push(disposable);
	console.log('[DEBUG] Command registered and context updated.');
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('[DEBUG] Deactivating Copilot Logger extension...');
}
