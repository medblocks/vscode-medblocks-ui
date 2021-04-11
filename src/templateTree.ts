import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TransformFunction } from './defaultTransform'
import { pathExists, getTransform } from './utils';
import { TemplateItem, Snippet, Tree } from './templateItem';

export type TemplateSnippetItem = TemplateItem | Snippet



export class TemplateTreeProvider implements vscode.TreeDataProvider<TemplateSnippetItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<TemplateSnippetItem | undefined | void> = new vscode.EventEmitter<TemplateSnippetItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<TemplateSnippetItem | undefined | void> = this._onDidChangeTreeData.event;

	constructor(public workspaceRoot: string, public transform?: TransformFunction, public textfile: string = vscode.window.activeTextEditor?.document?.getText()) {

	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	setCurrentTextFile(file: string) {
		this.textfile = file
	}

	async refreshConfig() {
		this.transform = await getTransform(this.workspaceRoot)
	}

	getTreeItem(element: TemplateSnippetItem): vscode.TreeItem {
		return element.treeItem;
	}

	getChildren(element?: TemplateSnippetItem): Thenable<TemplateSnippetItem[]> {
		if (!this.workspaceRoot) {
			return Promise.resolve([]);
		}
		if (!element) {
			return Promise.resolve(this.getTemplates())
		}
		if (element.type === 'snippet') {
			throw new Error('Snippet should not have called children')
		}
		if (element.leaf) {
			return Promise.resolve(element.getSnippets(this.transform))
		} else {
			return Promise.resolve(element.getChildren())
		}
	}

	private getTemplatePaths(): string[] {
		const templatesPath = path.join(this.workspaceRoot, 'templates');
		if (pathExists(templatesPath)) {
			const templates = fs.readdirSync(templatesPath)
			if (!(templates?.length > 0)) {
				vscode.window.showInformationMessage(`Found no templates in templates directory`);
			}
			return templates
		} else {
			vscode.window.showInformationMessage('Workspace has no templates directory');
			return [];
		}
	}

	private async getTemplates(): Promise<TemplateItem[]> {
		const paths = this.getTemplatePaths()
		const data = await Promise.all(paths
			.map(async (t) => {
				const p = path.join(this.workspaceRoot, 'templates', t)
				const string = await fs.promises.readFile(p, 'utf-8')
				try {
					const json = JSON.parse(string)
					return new TemplateItem(this.process(json.tree), t)
				}
				catch (e) {
					console.error(e)
					return
				}
			}))
		return data.filter(a => a)
	}


	private process(tree: Tree): Tree {
		const preProcess = (element, parent) => {
			element.path = parent ? `${parent.path}/${element.id}` : element.id
			element.regex = parent ? `${parent.regex}/${element.id}` : element.id
			element.runtimeRegex = parent ? `${parent.runtimeRegex}/${element.id}` : element.id
			if (element.max === -1 || element.max > 1) {
				element.path = `${element.path}:0`
				element.runtimeRegex = `${element.runtimeRegex}:(\\d|\\\${.*})`
				element.regex = `${element.regex}:(\\d)`
			}
			let node: Tree
			if (element.children) {
				node = {
					...element,
					children: element.children.map(child => preProcess(child, element))
				}
			} else {
				node = {
					...element,
				}
			}
			node = {
				...node,
				status: this.processStatus(node),
				snippet: this.processSnippets(node)
			}
			return node
		}
		const preprocessed = preProcess(tree, null)
		return preprocessed
	}

	private processSnippets(tree: Tree): string {
		const leaf = !tree?.children?.length
		if (leaf) {
			return this.transform(tree)[0].html
		} else {
			return tree.children.map(child => child.snippet).join('\n')
		}
	}

	private processStatus(tree: Tree): 'present' | 'optionalAbsent' | 'mandatoryAbsent' | 'allPresent' {
		const leaf = !tree?.children?.length
		const mandatory = tree.min >= 1
		const present = this.searchPath(new RegExp(tree.runtimeRegex))
		if (tree.path === 'boutolin_medication/medication_order/order:0/route:0') {
			console.log('')
		}

		if (leaf && present) {
			return 'allPresent'
		}

		if (!present) {
			return mandatory ? 'mandatoryAbsent' : 'optionalAbsent'
		}
		// Checks for group
		const someChildrenNotPresent = tree.children.some(child => child.status !== 'allPresent')
		if (mandatory) {
			if (!present) {

				return 'mandatoryAbsent'
			}
			if (someChildrenNotPresent) {
				if (tree.children.some(child => child.status === 'mandatoryAbsent')) {
					return 'mandatoryAbsent'
				} else {
					return 'present'
				}
			} else {
				return 'allPresent'
			}
		} else {
			if (someChildrenNotPresent) {
				if (tree.children.some(child => child.status === 'mandatoryAbsent')) {
					if (tree.children.some(child => child.status !== 'optionalAbsent')) {
						return 'mandatoryAbsent'
					} else {
						return 'optionalAbsent'
					}
				} else {
					return 'present'
				}
			} else {
				return 'allPresent'
			}
		}
	}

	private searchPath(path: string | RegExp): boolean {
		const result = this.textfile.search(path) >= 0
		return result
		// return false
	}



}