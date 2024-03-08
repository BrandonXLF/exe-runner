import * as vscode from 'vscode';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let terminal: vscode.Terminal | undefined;

function runExe(fileUri?: vscode.Uri) {
	// Fallback to active editor for command palette
	fileUri = fileUri || vscode.window.activeTextEditor?.document.uri;

	// Handle remote editors
	if (!fileUri || fileUri.scheme !== 'file') {
		vscode.window.showErrorMessage('Selected file is an invalid local file.');
		return;
	}

	const config = vscode.workspace.getConfiguration('exeRunner'),
		filePath = fileURLToPath(fileUri.toString()),
		isWin = process.platform === 'win32';

	// Reuse the previous terminal if it exists
	terminal = terminal ?? vscode.window.createTerminal('exe Runner');

	if (config.get('clearTerminal')) {
		terminal.sendText(isWin ? 'cls' : 'clear');
	}

	terminal.show();

	let command = '';

	if (config.get('runInFileDirectory')) {
		const directory = dirname(filePath);
		command += `cd "${directory}" && `;
	}

	if (!isWin) {
		command += config.get('compatibilityLayer') + ' ';
	}

	terminal.sendText(`${command}"${filePath}"`);

	// Unset the terminal variable when the terminal is closed
	vscode.window.onDidCloseTerminal(closedTerminal => {
		if (closedTerminal === terminal) {
			terminal = undefined;
		}
	});
}

export function activate(context: vscode.ExtensionContext) {
	// Restore persistence terminal
	terminal = vscode.window.terminals.find(term => term.name === 'exe Runner');

	context.subscriptions.push(
		vscode.commands.registerCommand('exe-runner.run', runExe)
	);
}