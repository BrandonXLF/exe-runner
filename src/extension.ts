import * as vscode from 'vscode';
import * as url from 'url';
import { basename } from 'path';

let terminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('exe-runner.run', (fileUri: vscode.Uri) => {
		let path: string;

		try {
			path = url.fileURLToPath(fileUri.toString());
		} catch (e) {
			vscode.window.showErrorMessage(`Failed to run .exe file. ${e.message}.`);
			return;
		}

		if (!path.endsWith('.exe')) {
			vscode.window.showErrorMessage(`${basename(path)} is not an .exe file.`);
			return;
		}

		terminal = terminal || vscode.window.createTerminal('exe Runner');
		terminal.show();
		terminal.sendText(`\"${path}\"`);

		vscode.window.onDidCloseTerminal(() => terminal = undefined);
	}));
}
