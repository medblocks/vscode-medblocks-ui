import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as visit from 'unist-util-visit'
import { TransformFunction } from './defaultTransform'
import { pathExists, getTransform } from './utils';

export class DepNodeProvider implements vscode.TreeDataProvider<UINode> {

	private _onDidChangeTreeData: vscode.EventEmitter<UINode | undefined | void> = new vscode.EventEmitter<UINode | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<UINode | undefined | void> = this._onDidChangeTreeData.event;

	workspaceRoot: string
	transform: TransformFunction
	textfile: string

	constructor(workspaceRoot: string, transform?: TransformFunction) {
		this.workspaceRoot = workspaceRoot
		this.transform = transform
	}


	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	setCurrentTextFile(file: string){
		this.textfile = file
	}

	async refreshConfig() {
		this.transform = await getTransform(this.workspaceRoot)
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
				let node: UINode
				if (child.children && child.children.length) {
					node = new UINode(child.id, child.rmType, child, vscode.TreeItemCollapsibleState.Collapsed)
				}
				else {
					const uiSnippets = this.transform(child)
					const collapsable = uiSnippets && uiSnippets.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
					node = new UINode(child.id, child.rmType, child, collapsable, uiSnippets)
					node.contextValue = 'leaf'
				}
				const currentFile = vscode.workspace.workspaceFile

				if (currentFile) {
					const file = vscode.workspace.fs.readFile(currentFile)
					console.debug(file)
				}
				node.iconPath = new vscode.ThemeIcon('circle-outline')
				return node
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

	copyAction(transform: Function): string {
		if (this.contextValue === 'leaf') {
			const snippets = this.snippetNodes()
			if (snippets?.length) {
				return snippets[0].data
			}
		}
		else if (this.contextValue === 'snippet') {
			return this.data
		}
		else {
			let snippets: string[] = []
			visit(this.data, (node, index, parent) => {
				if (!node.children) {
					const nodeSnippets = transform(node)
					if (nodeSnippets && nodeSnippets.length) {
						snippets = [...snippets, nodeSnippets[0].html]
					}
				}
			})
			return snippets.join('\n')
		}
	}

	snippetNodes() {
		if (this?.snippets?.length) {
			return this.snippets.map((snippet) => {
				const s = new UINode(snippet.name, '', snippet.html, vscode.TreeItemCollapsibleState.None)
				s.contextValue = 'snippet';
				return s
			})
		}
		return []
	}
}
