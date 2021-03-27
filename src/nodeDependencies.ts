import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const visit = require('unist-util-visit')

export class DepNodeProvider implements vscode.TreeDataProvider<UINode> {

	private _onDidChangeTreeData: vscode.EventEmitter<UINode | undefined | void> = new vscode.EventEmitter<UINode | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<UINode | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: UINode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: UINode): Thenable<UINode[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No templates in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return element.data.children.filter(child => !child.inContext).map(child => {
				const collapsable = child.children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None

				const node = new UINode(child.id, child.rmType, child, collapsable)
				if (!child.children) {
					node.contextValue = 'leaf'
					node.iconPath = {
						light: path.join(__filename, '..', '..', 'resources', 'light', 'number.svg'),
						dark: path.join(__filename, '..', '..', 'resources', 'dark', 'number.svg')
					};
				}
				return node
			})

		} else {
			const templatesPath = path.join(this.workspaceRoot, 'templates');
			if (this.pathExists(templatesPath)) {
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
			})
			console.debug({ processed })
			return new UINode(t, 'Template', processed, vscode.TreeItemCollapsibleState.Collapsed)
		})
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class UINode extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly type: string,
		public readonly data: any,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}-${this.type}`;
		this.description = this.type;
	}
}
