"use strict";

import * as vscode from "vscode";

import { TemplateTreeProvider, TemplateSnippetItem } from "./templateTree";
import { } from './templateItem'
import { getTransform } from "./utils";
export async function activate(context: vscode.ExtensionContext) {
	const configuration = await getTransform(vscode.workspace.rootPath);
	const templateTree = new TemplateTreeProvider(
		vscode.workspace.rootPath,
		configuration,
	);
	vscode.window.registerTreeDataProvider(
		"nodeDependencies",
		templateTree
	);
	vscode.commands.registerCommand("nodeDependencies.refreshEntry", () => {
		templateTree.refreshConfig();
		templateTree.refresh();
	});
	vscode.commands.registerCommand("extension.openPackageOnNpm", (moduleName) =>
		vscode.commands.executeCommand(
			"vscode.open",
			vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)
		)
	);
	vscode.commands.registerCommand(
		"nodeDependencies.copy",
		async (node: TemplateSnippetItem) => {
			if (node.type === 'templateItem') {
				vscode.env.clipboard.writeText(node.copy(templateTree.transform))
				vscode.window.showInformationMessage(`Copied ${node.displayLabel}.`);
			}
			else {
				vscode.env.clipboard.writeText(node.copy())
				vscode.window.showInformationMessage(`Copied snippet ${node.snipppet.name}.`);
			}

		}
	);
	// vscode.commands.registerCommand(
	// 	"nodeDependencies.deleteEntry",
	// 	(node: UINode) =>
	// 		vscode.window.showInformationMessage(
	// 			`Successfully called delete entry on ${node.label}.`
	// 		)
	// );

	vscode.workspace.onDidChangeTextDocument(() => {
		templateTree.setCurrentTextFile(vscode.window.activeTextEditor?.document.getText());
		templateTree.refresh();
	});

	vscode.window.onDidChangeActiveTextEditor(() => {
		templateTree.setCurrentTextFile(vscode.window.activeTextEditor?.document.getText());
		templateTree.refresh();
	})
}
