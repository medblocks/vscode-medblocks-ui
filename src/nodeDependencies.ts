import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const visit = require('unist-util-visit')
import defaultTransform, { TransformFunction } from './defaultTransform'
import { pathExists, getTransform } from './utils';

export class DepNodeProvider implements vscode.TreeDataProvider<UINode> {

	private _onDidChangeTreeData: vscode.EventEmitter<UINode | undefined | void> = new vscode.EventEmitter<UINode | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<UINode | undefined | void> = this._onDidChangeTreeData.event;

	workspaceRoot: string
	transform: TransformFunction

	constructor(workspaceRoot: string, transform?: TransformFunction) {
		this.workspaceRoot = workspaceRoot
		this.transform = transform || getTransform(workspaceRoot)
	}



	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	refreshConfig(): void {
		this.transform = getTransform(this.workspaceRoot)
	}

	getTreeItem(element: UINode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: UINode): Thenable<UINode[]> {
		if (!this.workspaceRoot) {
			return Promise.resolve([]);
		}

		if (element) {
			if (element.contextValue === 'leaf') {
				return element.snippetNodes()
			}

			return element.data.children.map(child => {
				vscode.TreeItemCollapsibleState.None
				if (child.children && child.children.length) {
					const node = new UINode(child.id, child.rmType, child, vscode.TreeItemCollapsibleState.Collapsed)
					return node
				}
				else {
					const uiSnippets = this.transform(child)
					const collapsable = uiSnippets && uiSnippets.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
					const node = new UINode(child.id, child.rmType, child, collapsable, uiSnippets)
					node.contextValue = 'leaf'
					node.iconPath = {
						light: path.join(__filename, '..', '..', 'resources', 'light', 'number.svg'),
						dark: path.join(__filename, '..', '..', 'resources', 'dark', 'number.svg')
					}
					return node
				}
			})

		} else {
			const templatesPath = path.join(this.workspaceRoot, 'templates');
			if (pathExists(templatesPath)) {
				const templates = fs.readdirSync(templatesPath)
				if (!(templates?.length > 0)) {
					vscode.window.showInformationMessage(`Found no templates in templates directory`);
				}
				return Promise.resolve(this.getNodes(templates))
				// return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no templates directory');
				return Promise.resolve([]);
			}
		}

	}


	private getNodes(templates: string[]): UINode[] {
		return templates.map(t => {
			const templatePath = path.join(this.workspaceRoot, 'templates', t)
			const data = JSON.parse(fs.readFileSync(templatePath, 'utf-8'))
			const processTree = (element) => {
				if (element.children) {
					return {
						...element,
						type: element.rmType,
						children: element.children.map(child => processTree(child))
					}
				} else {
					return {
						...element,
						type: element.rmType
					}
				}
			}
			let processed = processTree(data.tree)
			visit(processed, (node, index, parent) => {
				node.path = parent ? `${parent.path}/${node.id}` : node.id
				if (node.max === -1 || node.max > 1) {
					node.path = `${node.path}:0`
				}
			})
			return new UINode(t, 'Template', processed, vscode.TreeItemCollapsibleState.Collapsed)
		})
	}


}

export class UINode extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly type: string,
		public data: any,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly snippets?: any
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}-${this.type}`;
		this.description = this.type;
	}

	async snippetNodes() {
		if (this?.snippets?.length) {
			return this.snippets.map((snippet) => {
				const s = new UINode(snippet.name, '', { path: snippet.html }, vscode.TreeItemCollapsibleState.None)
				s.contextValue = 'leaf';
				return s
			})
		}
		return []
	}
}
