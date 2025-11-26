import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE_NAME = 'copilot-activity-log.txt';

class Logger {
	private readonly logFilePath: string;
	private warnedMissingDir = false;
	private warnedMissingFile = false;

	constructor(logFilePath: string) {
		this.logFilePath = logFilePath;
	}

	writeLog(content: string): void {
		if (!this.ensureResources()) {
			return;
		}

		const timestamp = new Date().toISOString();
		const entry = `[${timestamp}] ${content}\n\n`;

		// Open the document in the editor and prepend the entry at the top
		vscode.workspace.openTextDocument(this.logFilePath).then((doc) => {
			vscode.window.showTextDocument(doc, { preview: false }).then((editor) => {
				editor.edit((editBuilder) => {
					editBuilder.insert(new vscode.Position(0, 0), entry);
				}).then((applied) => {
					if (applied) {
						console.log(`[DEBUG] Log written to: ${this.logFilePath} (prepended)`);
					} else {
						console.error('[ERROR] Failed to apply editor edit when writing log entry.');
						vscode.window.showErrorMessage('Failed to write log entry to editor.');
					}
				});
			}, (showErr) => {
				console.warn(`[WARNING] Unable to show log file in editor: ${showErr?.message || showErr}`);
				// Fallback to direct fs write (prepend)
				try {
					const existingContent = fs.readFileSync(this.logFilePath, 'utf-8');
					fs.writeFileSync(this.logFilePath, entry + existingContent, 'utf-8');
					console.log(`[DEBUG] Log written to: ${this.logFilePath} (fs fallback, prepended)`);
				} catch (fsErr) {
					const errorMessage = fsErr instanceof Error ? fsErr.message : 'Unknown error';
					console.error(`[ERROR] Failed to write to log file: ${errorMessage}`);
					vscode.window.showErrorMessage(`Failed to write to log file: ${errorMessage}.`);
				}
			});
		}, (openErr) => {
			const errorMessage = openErr instanceof Error ? openErr.message : String(openErr);
			console.warn(`[WARNING] Unable to open log file: ${errorMessage}`);
			vscode.window.showWarningMessage('Unable to open log file in editor. Ensure the file exists and is accessible.');
		});
	}

	private ensureResources(): boolean {
		const logsDir = path.dirname(this.logFilePath);
		if (!fs.existsSync(logsDir)) {
			if (!this.warnedMissingDir) {
				this.warnedMissingDir = true;
				vscode.window.showWarningMessage(
					'Logs directory does not exist. Please create a `logs/` folder in your workspace.'
				);
			}
			return false;
		}

		if (!fs.existsSync(this.logFilePath)) {
			if (!this.warnedMissingFile) {
				this.warnedMissingFile = true;
				vscode.window.showWarningMessage(
					`Log file ${LOG_FILE_NAME} is missing. Create the file inside logs/ to enable logging.`
				);
			}
			return false;
		}

		return true;
	}

	private openLogFile(): void {
		void vscode.workspace.openTextDocument(this.logFilePath).then(
			(doc) => {
				void vscode.window.showTextDocument(doc, { preview: false });
			},
			(error) => console.warn(`[WARNING] Unable to open log file: ${error?.message || error}`)
		);
	}
}

class CopilotInteractionHandler {
	private readonly logger: Logger;
	private readonly outputChannel: vscode.OutputChannel;
	private static readonly MAX_MESSAGES = 50;

	constructor(logger: Logger, outputChannel: vscode.OutputChannel) {
		this.logger = logger;
		this.outputChannel = outputChannel;
	}

	listenForInteractions(context: vscode.ExtensionContext): void {
		const disposable = vscode.workspace.onDidChangeTextDocument((event) => this.handleDocumentChange(event));
		context.subscriptions.push(disposable);
	}

	private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
		const editor = vscode.window.activeTextEditor;
		if (!editor || event.document.uri.toString() !== editor.document.uri.toString()) {
			return;
		}

		const deltaText = event.contentChanges.map((change) => change.text).join('');
		if (!deltaText) {
			return;
		}

		if (!/copilot/i.test(deltaText)) {
			return;
		}

		const snippet = deltaText.trim().replace(/\s+/g, ' ').slice(0, 200);
		this.logger.writeLog(`Detected Copilot interaction: ${snippet}`);
		this.appendToOutputChannel(snippet);
	}

	private appendToOutputChannel(message: string): void {
		const timestamp = new Date().toISOString();
		this.outputChannel.appendLine(`[${timestamp}] ${message}`);
		this.outputChannel.show(true); // reveal but don't steal focus
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
