import * as vscode from 'vscode';
import { fileURLToPath } from 'url';
import { basename } from 'path';

let terminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('exe-runner.run', (fileUri: vscode.Uri) => {
		let filePath = fileURLToPath(fileUri.toString());
		let isWin = process.platform === 'win32';

		if (!filePath.endsWith('.exe')) {
			vscode.window.showErrorMessage(`${basename(filePath)} is not an .exe file.`);
			return;
		}

		terminal = terminal || vscode.window.createTerminal('exe Runner', isWin ? 'C:\\Windows\\System32\\cmd.exe' : undefined);
		terminal.show();
		terminal.sendText(`${isWin ? '' : 'wine '}"${filePath}"`);

		vscode.window.onDidCloseTerminal(() => terminal = undefined);
	}));
}