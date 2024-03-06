import * as vscode from 'vscode';
import { fileURLToPath } from 'url';

let terminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('exe-runner.run', (fileUri: vscode.Uri) => {
		// Fallback to active editor for command palette
		fileUri = fileUri || vscode.window.activeTextEditor?.document.uri;

		// Handle remote editors
		if (!fileUri || fileUri.scheme !== 'file') {
			vscode.window.showErrorMessage('Selected file is an invalid local file.');
			return;
		}

		const filePath = fileURLToPath(fileUri.toString()),
			isWin = process.platform === 'win32';

		// Reuse the previous terminal if it exists
		terminal = terminal ?? vscode.window.createTerminal('exe Runner');
		terminal.show();
		terminal.sendText(`${isWin ? '' : 'wine '}"${filePath}"`);

		// Unset the terminal variable when the terminal is closed
		vscode.window.onDidCloseTerminal(closedTerminal => {
			if (closedTerminal === terminal) {
				terminal = undefined;
			}
		});
	}));
}