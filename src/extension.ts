"use strict";

import * as vscode from "vscode";

import { TemplateTreeProvider, TemplateSnippetItem } from "./templateTree";
import { TemplateItem } from './templateItem'
import { getTransform } from "./utils";
export async function activate(context: vscode.ExtensionContext) {
	const configuration = await getTransform(vscode.workspace.rootPath);
	const templateTree = new TemplateTreeProvider(
		vscode.workspace.rootPath,
		configuration,
	);
	vscode.window.registerTreeDataProvider(
		"templateTree",
		templateTree
	);
	vscode.commands.registerCommand("templateTree.refreshEntry", () => {
		templateTree.refreshConfig();
		templateTree.refresh();
	});

	vscode.commands.registerCommand(
		"templateTree.copy",
		async (node: TemplateSnippetItem) => {
			vscode.env.clipboard.writeText(node.copy())
			if (node.type === 'templateItem') {
				vscode.window.showInformationMessage(`Copied ${node.displayLabel}.`);
			}
			else {
				vscode.window.showInformationMessage(`Copied snippet ${node.snipppet.name}.`);
			}

		}
	);
	vscode.commands.registerCommand(
		"templateTree.copyAql",
		(node: TemplateItem) => {
			vscode.env.clipboard.writeText(node.tree.aqlPath)
			vscode.window.showInformationMessage(`Copied AQL of ${node.label}.`)
		}
	);

	vscode.workspace.onDidChangeTextDocument(() => {
		templateTree.setCurrentTextFile(vscode.window.activeTextEditor?.document.getText());
		templateTree.refresh();
	});

	vscode.window.onDidChangeActiveTextEditor(() => {
		templateTree.setCurrentTextFile(vscode.window.activeTextEditor?.document.getText());
		templateTree.refresh();
	})
}
