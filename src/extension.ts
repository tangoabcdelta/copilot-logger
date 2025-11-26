import * as vscode from 'vscode'; // Import the VS Code API for extension development
import * as fs from 'fs'; // Import the Node.js file system module for file operations
import * as path from 'path'; // Import the Node.js path module for handling file paths

const LOG_FILE_NAME = 'copilot-activity-log.txt'; // Define the name of the log file

class Logger {
	private readonly logFilePath: string; // Path to the log file
	private warnedMissingDir = false; // Flag to track if the logs directory warning has been shown
	private warnedMissingFile = false; // Flag to track if the log file warning has been shown

	constructor(logFilePath: string) {
		this.logFilePath = logFilePath; // Initialize the log file path
	}

	writeLog(content: string): void {
		// if (!this.ensureResources()) { // Ensure the log directory and file exist
		// 	return; // Exit if resources are missing
		// }

		const timestamp = new Date().toISOString(); // Get the current timestamp
		const entry = `[${timestamp}] ${content}\n\n`; // Format the log entry

		// Open the document in the editor and prepend the entry at the top
		vscode.workspace.openTextDocument(this.logFilePath).then((doc) => {
			console.log(`[DEBUG] opened text document`); // Log success
			vscode.window.showInformationMessage(`[DEBUG] opened text document`);

			// Show the document in the editor. The `preview: false` option ensures that the document
			// remains open in a dedicated tab, rather than being replaced if another file is opened.
			vscode.window.showTextDocument(doc, { preview: false }).then((editor) => {

				// Edit the document by inserting the log entry at the top of the file.
				editor.edit((editBuilder) => {
					editBuilder.insert(new vscode.Position(0, 0), entry); // Insert the log entry at the top
				}).then((applied) => {
					if (applied) {
						console.log(`[DEBUG] Log written to: ${this.logFilePath} (prepended)`); // Log success
					} else {
						console.error('[ERROR] Failed to apply editor edit when writing log entry.'); // Log failure
						vscode.window.showErrorMessage('[ERROR] Failed to apply editor edit when writing log entry.'); // Show error message
					}
				}, (editErr: unknown) => {
					// Handle errors that occur during the edit operation.
					const errorMessage = editErr instanceof Error ? editErr.message : String(editErr);
					console.error(`[ERROR] Failed to edit document: ${errorMessage}`);
					vscode.window.showErrorMessage(`Failed to edit document: ${errorMessage}`);
				});
			}, (showErr: unknown) => {
				// Handle errors that occur while showing the document in the editor.
				const errorMessage = showErr instanceof Error ? showErr.message : String(showErr);
				console.warn(`[WARNING] Unable to show log file in editor: ${errorMessage}`);
				vscode.window.showWarningMessage(`[WARNING] Unable to show log file in editor: ${errorMessage}`);

				// Fallback: If the document cannot be shown in the editor, prepend the log entry directly to the file.
				try {
					const existingContent = fs.readFileSync(this.logFilePath, 'utf-8'); // Read existing content
					fs.writeFileSync(this.logFilePath, entry + existingContent, 'utf-8'); // Prepend the log entry
					console.log(`[DEBUG] Log written to: ${this.logFilePath} (fs fallback, prepended)`); // Log success
					vscode.window.showInformationMessage(`[DEBUG] Log written to: ${this.logFilePath} (fs fallback, prepended)`);
				} catch (fsErr: unknown) {
					// Handle errors that occur during the fallback file write operation.
					const fsErrorMessage = fsErr instanceof Error ? fsErr.message : 'Unknown error';
					console.error(`[ERROR] Failed to write to log file: ${fsErrorMessage}`);
					vscode.window.showErrorMessage(`[ERROR] Failed to write to log file: ${fsErrorMessage}`);
				}
			});
		}, (openErr: unknown) => {
			// Handle errors that occur while opening the document.
			const errorMessage = openErr instanceof Error ? openErr.message : String(openErr);
			console.warn(`[WARNING] Unable to open log file: ${errorMessage}`);
			vscode.window.showWarningMessage(`[WARNING] Unable to open log file: ${errorMessage}`);
		});
	}

	private ensureResources(): boolean {
		const logsDir = path.dirname(this.logFilePath); // Get the directory of the log file
		if (!fs.existsSync(logsDir)) { // Check if the directory exists
			if (!this.warnedMissingDir) { // Check if the warning has been shown
				this.warnedMissingDir = true; // Set the warning flag
				vscode.window.showWarningMessage(
					'Logs directory does not exist. Please create a `logs/` folder in your workspace.'
				); // Show warning message
			}
			return false; // Return false if the directory is missing
		}

		if (!fs.existsSync(this.logFilePath)) { // Check if the log file exists
			if (!this.warnedMissingFile) { // Check if the warning has been shown
				this.warnedMissingFile = true; // Set the warning flag
				vscode.window.showWarningMessage(
					`Log file ${LOG_FILE_NAME} is missing. Create the file inside logs/ to enable logging.`
				); // Show warning message
			}
			return false; // Return false if the log file is missing
		}

		return true; // Return true if resources exist
	}

	private openLogFile(): void {
		void vscode.workspace.openTextDocument(this.logFilePath).then(
			(doc) => {
				void vscode.window.showTextDocument(doc, { preview: false }); // Open the log file in the editor
			},
			(error) => {

			console.warn(`[WARNING] Unable to open log file: ${error?.message || error}`); // Log warning
			vscode.window.showInformationMessage(`[WARNING] Unable to open log file: ${error?.message || error}`);
			}
		);
	}
}

class CopilotInteractionHandler {
	private readonly logger: Logger; // Logger instance for writing logs
	private readonly outputChannel: vscode.OutputChannel; // Output channel for displaying interactions
	private static readonly MAX_MESSAGES = 50; // Maximum number of messages to display

	constructor(logger: Logger, outputChannel: vscode.OutputChannel) {
		this.logger = logger; // Initialize the logger
		this.outputChannel = outputChannel; // Initialize the output channel
	}

	listenForInteractions(context: vscode.ExtensionContext): void {
		const disposable = vscode.workspace.onDidChangeTextDocument((event) => this.handleDocumentChange(event)); // Listen for text document changes
		context.subscriptions.push(disposable); // Add the listener to the context subscriptions
	}

	private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
		const editor = vscode.window.activeTextEditor; // Get the active text editor
		if (!editor || event.document.uri.toString() !== editor.document.uri.toString()) { // Check if the event is for the active editor
			return; // Exit if not
		}

		const deltaText = event.contentChanges.map((change) => change.text).join(''); // Get the changed text
		if (!deltaText) { // Check if there is any changed text
			return; // Exit if not
		}

		if (!/copilot/i.test(deltaText)) { // Check if the changed text contains "copilot"
			return; // Exit if not
		}

		const snippet = deltaText.trim().replace(/\s+/g, ' ').slice(0, 200); // Format the snippet
		this.logger.writeLog(`Detected Copilot interaction: ${snippet}`); // Log the interaction
		this.appendToOutputChannel(snippet); // Append the interaction to the output channel
	}

	private appendToOutputChannel(message: string): void {
		const timestamp = new Date().toISOString(); // Get the current timestamp
		this.outputChannel.appendLine(`[${timestamp}] ${message}`); // Append the message to the output channel
		this.outputChannel.show(true); // Reveal the output channel
	}
}

// ChatSessionScanner scans VS Code workspace storage for Copilot chat sessions
class ChatSessionScanner {
	private readonly logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	scanAndLog(): void {
		const appData = process.env.APPDATA || process.env.XDG_CONFIG_HOME || '';
		if (!appData) {
			console.warn('[WARNING] APPDATA/XDG_CONFIG_HOME not set; skipping chat session scan.');
			return;
		}

		const storageRoot = path.join(appData, 'Code', 'User', 'workspaceStorage');
		if (!fs.existsSync(storageRoot)) {
			console.warn(`[WARNING] VS Code workspaceStorage not found at ${storageRoot}`);
			return;
		}

		try {
			const workspaceIds = fs.readdirSync(storageRoot);
			workspaceIds.forEach((workspaceId) => {
				const chatDir = path.join(storageRoot, workspaceId, 'chatSessions');
				if (!fs.existsSync(chatDir)) {
					return;
				}

				const chatFiles = fs.readdirSync(chatDir);
				chatFiles.forEach((chatFile) => {
					const chatFilePath = path.join(chatDir, chatFile);
					try {
						const raw = fs.readFileSync(chatFilePath, 'utf-8');
						let parsed: any = null;
						try {
							parsed = JSON.parse(raw);
						} catch (e) {
							// Not JSON — treat raw as a text session
						}

						// Extract title: prefer explicit title, fallback to first message
						let title = parsed?.title || parsed?.metadata?.title || '';
						let messages: string[] = [];
						if (parsed?.messages && Array.isArray(parsed.messages)) {
							messages = parsed.messages.map((m: any) => (m.text || m.content || String(m))).filter(Boolean);
						} else if (parsed?.items && Array.isArray(parsed.items)) {
							messages = parsed.items.map((m: any) => (m.text || m.content || String(m))).filter(Boolean);
						} else if (!parsed) {
							// fallback: split raw into lines and take first few
							messages = raw.split(/\r?\n/).slice(0, 10).filter(Boolean);
						}

						if (!title && messages.length > 0) {
							title = messages[0].slice(0, 120);
						}

						// Attempt to resolve workspace path from stored config if available
						let resolvedPath = parsed?.workspace?.folder || parsed?.config?.workspacePath || '';
						if (!resolvedPath) {
							// try other common keys
							resolvedPath = parsed?.workspaceFolder || '';
						}

						const entryLines: string[] = [];
						entryLines.push(`Chat session: ${title || chatFile}`);
						entryLines.push(`Workspace ID: ${workspaceId}`);
						if (resolvedPath) {
							entryLines.push(`Resolved path: ${resolvedPath}`);
						}
						entryLines.push(`Source file: ${chatFilePath}`);
						entryLines.push('Messages:');
						messages.slice(0, 50).forEach((m: string, idx: number) => {
							entryLines.push(`${idx + 1}. ${m.replace(/\r?\n/g, ' ').slice(0, 1000)}`);
						});

						this.logger.writeLog(entryLines.join('\n'));
					} catch (err) {
						console.warn(`[WARNING] Failed to read/parse chat session ${chatFilePath}: ${err instanceof Error ? err.message : err}`);
					}
				});
			});
		} catch (err) {
			console.warn(`[WARNING] Error scanning workspaceStorage: ${err instanceof Error ? err.message : err}`);
		}
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('[DEBUG] Activating Copilot Logger extension...');

	if (!vscode.workspace.isTrusted) {
		vscode.window.showErrorMessage('Workspace is not trusted. Please trust it to enable Copilot logging.');
		return;
	}

	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('Open a workspace folder to enable Copilot logging.');
		return;
	}

	const logDir = path.join(workspaceFolder.uri.fsPath, 'logs');
	const logFilePath = path.join(logDir, LOG_FILE_NAME);
	const logger = new Logger(logFilePath);

	// Create output channel for Copilot interactions (replaces popups)
	const outputChannel = vscode.window.createOutputChannel('Copilot Logger');
	context.subscriptions.push(outputChannel);

	const copilotHandler = new CopilotInteractionHandler(logger, outputChannel);

	logger.writeLog('Copilot Logger activated.');
	copilotHandler.listenForInteractions(context);

	// Scan existing chat sessions from workspaceStorage and write them to the log
	const scanner = new ChatSessionScanner(logger);
	try {
		scanner.scanAndLog();
	} catch (err) {
		console.warn('[WARNING] Chat session scanner failed:', err instanceof Error ? err.message : err);
		vscode.window.showInformationMessage(`[WARNING] Chat session scanner failed: ${err instanceof Error ? err.message : err}`);
	}

	// Command: Hello World
	const helloWorldCmd = vscode.commands.registerCommand('copilot-logger.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Copilot Logger!');
	});
	context.subscriptions.push(helloWorldCmd);

	// Command: Create Log Resources
	const createLogResourcesCmd = vscode.commands.registerCommand('copilot-logger.createLogResources', async () => {
		try {
			if (!fs.existsSync(logDir)) {
				fs.mkdirSync(logDir, { recursive: true });
				console.log(`[DEBUG] Created logs directory: ${logDir}`);
			}
			if (!fs.existsSync(logFilePath)) {
				fs.writeFileSync(logFilePath, '', 'utf-8');
				console.log(`[DEBUG] Created log file: ${logFilePath}`);
			}
			vscode.window.showInformationMessage(`Log resources created at: ${logDir}`);
			// Open the log file in the editor
			const doc = await vscode.workspace.openTextDocument(logFilePath);
			await vscode.window.showTextDocument(doc, { preview: false });
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			vscode.window.showErrorMessage(`Failed to create log resources: ${msg}`);
		}
	});
	context.subscriptions.push(createLogResourcesCmd);

	// Command: Import Chat Sessions
	const importChatSessionsCmd = vscode.commands.registerCommand('copilot-logger.importChatSessions', () => {
		try {
			scanner.scanAndLog();
			vscode.window.showInformationMessage('Chat sessions imported successfully.');
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			vscode.window.showErrorMessage(`Failed to import chat sessions: ${msg}`);
		}
	});
	context.subscriptions.push(importChatSessionsCmd);

	console.log('[DEBUG] Copilot Logger extension activated.');
}

export function deactivate() {
	console.log('[DEBUG] Deactivating Copilot Logger extension...');
}
