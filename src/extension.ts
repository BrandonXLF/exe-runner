import * as vscode from 'vscode';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let terminal: vscode.Terminal | undefined;
let extensionUri: vscode.Uri;

async function runExe(fileUri?: vscode.Uri, withFlags = false) {
	// Fallback to the active tab for command palette
	if (!fileUri) {
		const tabInput = vscode.window.tabGroups.activeTabGroup.activeTab?.input;

		if (
			tabInput instanceof vscode.TabInputText ||
			tabInput instanceof vscode.TabInputCustom
		) {
			fileUri = tabInput.uri;
		}
	}

	// Handle remote editors
	if (!fileUri || fileUri.scheme !== 'file') {
		vscode.window.showErrorMessage('Selected file is an invalid local file.');
		return;
	}

	const config = vscode.workspace.getConfiguration('exeRunner'),
		filePath = fileURLToPath(fileUri.toString()),
		isWin = process.platform === 'win32';

	// Create a new terminal if an existing one does not exist
	terminal = terminal ?? vscode.window.createTerminal({
		name: 'exe Runner',
		iconPath: {
			light: vscode.Uri.joinPath(extensionUri, 'media', 'light.svg'),
			dark: vscode.Uri.joinPath(extensionUri, 'media', 'dark.svg')
		}
	});

	if (config.get('clearTerminal')) {
		terminal.sendText(isWin ? 'cls' : 'clear');
	}

	terminal.show();

	// Ask for flags to append to the command
	let flags = '';

	if (withFlags) {
		flags = await vscode.window.showInputBox({
			prompt: 'Flags to run the executable with',
			placeHolder: '--example-flag value'
		}) ?? '';
	}

	let command = '';

	if (config.get('runInFileDirectory')) {
		const directory = dirname(filePath);
		command += `cd "${directory}" && `;
	}

	// @ts-ignore shellPath doesn't exist on ExtensionTerminalOptions
	const shellPath = terminal.creationOptions.shellPath ?? vscode.env.shell;

	// Execute with the & operator when using PowerShell
	if (isWin && (shellPath.endsWith('powershell.exe') || shellPath.endsWith('pwsh.exe'))) {
		command += '& ';
	} else if (!isWin) {
		command += config.get('compatibilityLayer') + ' ';
	}

	terminal.sendText(`${command}"${filePath}"${flags ? ' ' + flags : ''}`);

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
	extensionUri = context.extensionUri;

	context.subscriptions.push(
		vscode.commands.registerCommand('exe-runner.run', (fileUri?: vscode.Uri) => runExe(fileUri)),
		vscode.commands.registerCommand('exe-runner.runWithFlags', (fileUri?: vscode.Uri) => runExe(fileUri, true))
	);
}