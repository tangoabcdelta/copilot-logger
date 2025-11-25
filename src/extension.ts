// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('[DEBUG] Activating Copilot Logger extension...');

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "copilot-logger" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('copilot-logger.helloWorld', () => {
		console.log('[DEBUG] Hello World command executed.');
		// The code you place here will be executed every time your command is executed
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
