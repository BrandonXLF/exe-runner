import * as vscode from 'vscode';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let terminal: vscode.Terminal | undefined;
let extensionUri: vscode.Uri;

async function runExe(fileUri?: vscode.Uri, withArgs = false) {
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
	if (fileUri?.scheme !== 'file') {
		vscode.window.showErrorMessage('Selected file is an invalid local file.');
		return;
	}

	const config = vscode.workspace.getConfiguration('exeRunner'),
		filePath = fileURLToPath(fileUri.toString()),
		isWin = process.platform === 'win32';

	// Ask for args to append to the command
	let args: string | undefined;

	if (withArgs) {
		args = await vscode.window.showInputBox({
			prompt: 'Arguments to run the executable with',
			placeHolder: '--name value -flag'
		});

		if (args === undefined) {
			return;
		}
	}

	// Create a new terminal if an existing one does not exist
	terminal ??= vscode.window.createTerminal({
		name: 'exe Runner',
		iconPath: {
			light: vscode.Uri.joinPath(extensionUri, 'media', 'light.svg'),
			dark: vscode.Uri.joinPath(extensionUri, 'media', 'dark.svg')
		}
	});

	if (terminal && config.get('clearTerminal')) {
		terminal.sendText(isWin ? 'cls' : 'clear');
	}

	terminal.show();

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

	terminal.sendText(`${command}"${filePath}"${args ? ' ' + args : ''}`);

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
		vscode.commands.registerCommand('exe-runner.runWithArgs', (fileUri?: vscode.Uri) => runExe(fileUri, true))
	);
}