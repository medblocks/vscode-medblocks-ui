'use strict';

import * as vscode from 'vscode';

import { DepNodeProvider, UINode } from './nodeDependencies';
import { getTransform } from './utils';
export async function activate(context: vscode.ExtensionContext) {
	const configuration = await getTransform(vscode.workspace.rootPath)
	const nodeDependenciesProvider = new DepNodeProvider(vscode.workspace.rootPath, configuration);
	vscode.window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);
	vscode.commands.registerCommand('nodeDependencies.refreshEntry', () => {
		nodeDependenciesProvider.refreshConfig()
		nodeDependenciesProvider.refresh()
	});
	vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
	vscode.commands.registerCommand('nodeDependencies.copy', async (node: UINode) => {
		await vscode.env.clipboard.writeText(node.label)
		vscode.env.clipboard.writeText(node.data.path)
		vscode.window.showInformationMessage(`Copied ${node.label}.`)
	});
	vscode.commands.registerCommand('nodeDependencies.deleteEntry', (node: UINode) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));

	vscode.workspace.onDidSaveTextDocument((e) => {
		nodeDependenciesProvider.refresh()
	})
}