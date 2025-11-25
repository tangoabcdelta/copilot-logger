// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This method is called when your extension is activated.
 * The activation happens the very first time the command is executed.
 *
 * @param context - The extension context provided by VS Code.
 */
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('[DEBUG] Activating Copilot Logger extension...');

	// Show a popup to confirm activation and monitoring
	vscode.window.showInformationMessage('Copilot Logger activated and monitoring your Copilot chat.');

	// Ensure workspace trust and file writing permissions
	if (!vscode.workspace.isTrusted) {
		vscode.window.showErrorMessage('Workspace is not trusted. Please trust the workspace to enable file writing.');
		return;
	}

	// Check if the logs directory is writable
	const logsDir = path.join(__dirname, 'logs');
	try {
		if (!fs.existsSync(logsDir)) {
			fs.mkdirSync(logsDir, { recursive: true });
		}
		fs.accessSync(logsDir, fs.constants.W_OK);
		console.log('[DEBUG] Logs directory is writable.');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error(`[ERROR] Logs directory is not writable: ${errorMessage}`);
		vscode.window.showErrorMessage(`Logs directory is not writable: ${errorMessage}. Please check permissions or provide a writable directory.`);
		return;
	}

	// Ensure a single log file for all activities
	const logFilePath = path.join(__dirname, 'logs', 'copilot-activity-log.txt');

	function writeLog(content: string) {
		try {
			if (!fs.existsSync(logFilePath)) {
				throw new Error('Log file does not exist.');
			}

			// Prepend the latest activity with a timestamp
			const existingContent = fs.readFileSync(logFilePath, 'utf-8');
			const timestamp = new Date().toISOString();
			const newContent = `[${timestamp}] ${content}\n` + existingContent;
			fs.writeFileSync(logFilePath, newContent, 'utf-8');
			console.log(`[DEBUG] Log written to: ${logFilePath}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`[ERROR] Failed to write to log file: ${errorMessage}`);
			vscode.window.showErrorMessage(`Failed to write to log file: ${errorMessage}. Please create the file manually.`);

			// Ask the user to create the file and open it in the editor
			const logsDir = path.dirname(logFilePath);
			if (!fs.existsSync(logsDir)) {
				fs.mkdirSync(logsDir, { recursive: true });
			}
			fs.writeFileSync(logFilePath, '', 'utf-8');
			vscode.workspace.openTextDocument(logFilePath).then((doc) => {
				vscode.window.showTextDocument(doc);
			});
		}
	}

	// Example usage of writeLog function
	writeLog('Copilot Logger activated.');

	// Debounced function to show a single popup for Copilot queries
	let copilotPopupTimeout: NodeJS.Timeout | null = null;
	let copilotPopupContent: string[] = [];

	function showCopilotPopup() {
		if (copilotPopupContent.length > 0) {
			vscode.window.showInformationMessage(`Copilot Queries:\n${copilotPopupContent.join('\n')}`);
			copilotPopupContent = []; // Clear the content after showing
		}
	}

	// Listen for Copilot chat interactions
	vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document.uri.toString() === editor.document.uri.toString()) {
			const content = editor.document.getText();
			if (content.includes('copilot')) { // Example condition to detect Copilot-related text
				const logContent = `Copilot interaction detected: ${content}`;
				writeLog(logContent);

				copilotPopupContent.push(content);
				if (copilotPopupTimeout) {
					clearTimeout(copilotPopupTimeout);
				}
				copilotPopupTimeout = setTimeout(showCopilotPopup, 2000); // Debounce for 2 seconds
			}
		}
	});

	// Monitor Copilot chat output channel
	const copilotChannel = vscode.window.createOutputChannel('Copilot Chat Monitor');
	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor && editor.document.languageId === 'plaintext') { // Example condition for chat-like content
			const content = editor.document.getText();
			if (content.includes('copilot')) {
				copilotChannel.appendLine(`[CHAT DETECTED]: ${content}`);
				vscode.window.showInformationMessage(`Copilot Chat Detected: ${content}`);
			}
		}
	});

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
				// Additional debug log to verify logs directory path
				console.log(`[DEBUG] Attempting to create logs directory at: ${logsDir}`);

				// Ensure the parent directory exists before creating the logs directory
				const parentDir = path.dirname(logsDir);
				if (!fs.existsSync(parentDir)) {
					console.error(`[ERROR] Parent directory does not exist: ${parentDir}`);
					vscode.window.showErrorMessage(`Parent directory does not exist: ${parentDir}. Logs cannot be created.`);
					return;
				}

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

	// Monitor Copilot chat sessions from workspace storage and write to logs
	const appDataPath = process.env.APPDATA || '';
	const chatSessionsPath = path.join(appDataPath, 'Code', 'User', 'workspaceStorage');

	if (fs.existsSync(chatSessionsPath)) {
		fs.readdir(chatSessionsPath, (err, files) => {
			if (err) {
				console.error(`[ERROR] Failed to read workspaceStorage directory: ${err.message}`);
				return;
			}

			files.forEach((workspaceId) => {
				const chatPath = path.join(chatSessionsPath, workspaceId, 'chatSessions');
				if (fs.existsSync(chatPath)) {
					fs.readdir(chatPath, (chatErr, chatFiles) => {
						if (chatErr) {
							console.error(`[ERROR] Failed to read chatSessions directory: ${chatErr.message}`);
							return;
						}

						chatFiles.forEach((chatFile) => {
							const chatFilePath = path.join(chatPath, chatFile);
							fs.readFile(chatFilePath, 'utf-8', (readErr, data) => {
								if (readErr) {
									console.error(`[ERROR] Failed to read chat file: ${readErr.message}`);
									return;
								}

								console.log(`[DEBUG] Chat session loaded: ${chatFilePath}`);

								// Write chat session data to logs
								const logsDir = path.join(__dirname, 'logs');
								if (!fs.existsSync(logsDir)) {
									fs.mkdirSync(logsDir, { recursive: true });
								}
								const logFile = path.join(logsDir, `chat-log-${workspaceId}-${chatFile}`);
								fs.writeFileSync(logFile, data, { flag: 'w' });
								console.log(`[DEBUG] Chat session written to log: ${logFile}`);
								vscode.window.showInformationMessage(`Chat session logged: ${logFile}`);
							});
						});
					});
				}
			});
		});
	} else {
		console.error('[ERROR] workspaceStorage directory not found.');
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
