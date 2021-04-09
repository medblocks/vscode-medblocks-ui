import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";

export interface Tree {
	id: string,
	name: string,
	min: number,
	max: number,
	aqlPath: string,
	rmType: string,
	localizedName?: string,
	nodeID?: string,
	inContext?: boolean,
	localizedNames?: {
		[key: string]: string
	}
	localizedDescription?: {
		[key: string]: string
	},
	annotations?: {
		[key: string]: string
	}
	children?: Tree[],

	// Added
	path?: string
	snippet?: string,
	status?: 'present' | 'optionalAbsent' | 'mandatoryAbsent' | 'allPresent',
}

export class TemplateItem {
	type: 'templateItem' = 'templateItem'

	iconMap = {
		present: 'check',
		optionalAbsent: 'debug-breakpoint-unverified',
		mandatoryAbsent: 'issues',
		allPresent: 'check-all'
	}


	constructor(public tree: Tree, public label?: string) { }

	get icon(): ThemeIcon {
		return new ThemeIcon(this.iconMap[this.tree.status])
	}

	get displayLabel() {
		return this.label || this.tree.name || this.tree.id
	}

	get treeItem(): TreeItem {
		const item = new TreeItem(this.displayLabel, this.collapsibleState)
		item.tooltip = this.tooltip
		item.description = this.tree.rmType.toLocaleLowerCase()
		item.iconPath = this.icon
		item.contextValue = 'leaf'
		return item
	}

	get tooltip(): string {
		const exclude = ['children', 'inputs']
		return Object.entries(this.tree).map(([key, value]) => {
			if (!exclude.includes(key)) {
				return `${key}: ${JSON.stringify(value)}`
			}
		}).filter(n => n).join('\n')
	}

	get collapsibleState() {
		return TreeItemCollapsibleState.Collapsed
	}

	get leaf(): boolean {
		return this.tree.children && this.tree.children.length > 0 ? false : true
	}

	get mandatory(): boolean {
		return this.tree.min >= 1
	}

	getChildren(): TemplateItem[] {
		return this.tree.children.map(child => new TemplateItem(child))
	}

	copy(transform: Function): string {
		if (this.leaf) {
			const snippets = this.getSnippets(transform)
			if (snippets?.length) {
				return snippets[0].snipppet.html
			}
		}

		else {
			return this.tree.snippet
		}
	}

	getSnippets(transform: Function): Snippet[] {
		if (!this.leaf) {
			throw new Error('cannot get snippets on a non leaf node')
		}
		const snippets = transform(this.tree)
		return snippets.map(s => new Snippet(s))
	}
}

export class Snippet {
	type: 'snippet' = 'snippet'
	constructor(public snipppet: { html: string, name: string }) { }

	get treeItem(): TreeItem {
		const item = new TreeItem(this.snipppet.name, TreeItemCollapsibleState.None)
		item.contextValue = 'snippet'
		item.iconPath = new ThemeIcon('code')
		return item
	}

	copy() {
		return this.snipppet.html
	}
}