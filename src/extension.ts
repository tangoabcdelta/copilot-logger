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
		console.log(`[DEBUG] Workspace folder path: ${workspaceFolders[0].uri.fsPath}`);
		if (!fs.existsSync(workspaceFolders[0].uri.fsPath)) {
			console.error('[ERROR] Workspace folder path is invalid or inaccessible.');
			vscode.window.showErrorMessage('Workspace folder path is invalid or inaccessible. Logs cannot be created.');
			return;
		}

		// Check write permissions for the workspace folder
		try {
			fs.accessSync(workspaceFolders[0].uri.fsPath, fs.constants.W_OK);
			console.log('[DEBUG] Write permissions verified for workspace folder.');
		} catch (permissionError: any) {
			console.error('[ERROR] No write permissions for workspace folder:', permissionError.message);
			vscode.window.showErrorMessage('No write permissions for workspace folder. Logs cannot be created.');
			return;
		}

		const logsDir = path.join(workspaceFolders[0].uri.fsPath, 'logs');
		try {
			if (!fs.existsSync(logsDir)) {
				fs.mkdirSync(logsDir, { recursive: true });
				console.log(`[DEBUG] Created logs directory at: ${logsDir}`);
				vscode.window.showInformationMessage(`Logs directory created at: ${logsDir}`);
			}

			// Write a log file
			const logFile = path.join(logsDir, `log-${new Date().toISOString()}.txt`);
			fs.writeFileSync(logFile, 'Copilot Logger activated.\n', { flag: 'a' });
			console.log(`[DEBUG] Log file created: ${logFile}`);
		} catch (error: any) {
			console.error(`[ERROR] Failed to create logs directory or write log file: ${error.message}`);
			vscode.window.showErrorMessage(`Failed to create logs directory or write log file: ${error.message}`);
		}
	} else {
		console.error('[ERROR] No workspace folder found. Logs cannot be created.');
		vscode.window.showWarningMessage('No workspace folder found. Logs cannot be created. Would you like to create a default directory for logs?', 'Yes', 'No')
			.then(selection => {
				if (selection === 'Yes') {
					const defaultDir = path.join(__dirname, 'logs');
					try {
						if (!fs.existsSync(defaultDir)) {
							fs.mkdirSync(defaultDir, { recursive: true });
							console.log(`[DEBUG] Default logs directory created at: ${defaultDir}`);
							vscode.window.showInformationMessage(`Default logs directory created at: ${defaultDir}`);
						}
					} catch (error: any) {
						console.error(`[ERROR] Failed to create default logs directory: ${error.message}`);
						vscode.window.showErrorMessage(`Failed to create default logs directory: ${error.message}`);
					}
				}
			});
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
