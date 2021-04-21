import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";

export interface Tree {
  id: string;
  name: string;
  min: number;
  max: number;
  aqlPath: string;
  rmType: string;
  localizedName?: string;
  nodeID?: string;
  inContext?: boolean;
  localizedNames?: {
    [key: string]: string;
  };
  localizedDescriptions?: {
    [key: string]: string;
  };
  annotations?: {
    [key: string]: string;
  };
  children?: Tree[];

  [other: string]: any;
  // Added
  path?: string;
  runtimeRegex?: string;
  regex?: string;
  snippet?: string;
  context?: string;
  status?: "present" | "optionalAbsent" | "mandatoryAbsent" | "allPresent";
}

export class TemplateItem {
  type: "templateItem" = "templateItem";

  iconMap = {
    present: "check",
    optionalAbsent: "debug-breakpoint-unverified",
    mandatoryAbsent: "issues",
    allPresent: "check-all",
  };

  constructor(public tree: Tree, public label?: string) {}

  get icon(): ThemeIcon {
    return new ThemeIcon(this.iconMap[this.tree.status]);
  }

  get displayLabel() {
    return this.label || this.tree.name || this.tree.id;
  }

  get treeItem(): TreeItem {
    const item = new TreeItem(this.displayLabel, this.collapsibleState);
    item.tooltip = this.tooltip;
    item.description = this.tree.rmType.toLocaleLowerCase();
    item.iconPath = this.icon;
    item.contextValue = "leaf";
    return item;
  }

  get tooltip(): string {
    const exclude = [
      "children",
      "inputs",
      "snippet",
      "localizedName",
      "localizedDescriptions",
    ];
    const tree = {
      ...this.tree,
      description: this.tree?.localizedDescriptions?.["en"],
    };
    const statusDescriptions = {
      allPresent: "All child elements are present",
      optionalAbsent:
        "The element is optional, it's currently absent in this document",
      mandatoryAbsent:
        "This element (or some children) is mandatory, but is absent in the current document",
      present: "All mandatory child elements are present",
    };
    const str = `${tree.name || tree.id} | ${tree.rmType}
${tree.min}..${tree.max === -1 ? "*" : tree.max}
${statusDescriptions[tree.status]}
Path: ${tree.path}
${tree.description ? `Description: ${tree.description}\n` : ""}${
      tree.aqlPath ? `AQL Path: ${tree.aqlPath}\n` : ""
    }`;
    return str;
  }

  get collapsibleState() {
    return TreeItemCollapsibleState.Collapsed;
  }

  get leaf(): boolean {
    return this.tree.children && this.tree.children.length > 0 ? false : true;
  }

  get mandatory(): boolean {
    return this.tree.min >= 1;
  }

  getChildren(): TemplateItem[] {
    return this.tree.children.map((child) => new TemplateItem(child));
  }

  copy(): string {
    return this.tree.snippet;
  }

  getSnippets(transform: Function): Snippet[] {
    if (!this.leaf) {
      throw new Error("cannot get snippets on a non leaf node");
    }
    const snippets = transform(this.tree);
    return snippets.map((s) => new Snippet(s));
  }

  getRegex(): string {
    return new RegExp(this.tree.regex).toString();
  }
  getContext() {
    return this.tree.context;
  }
}

export class Snippet {
  type: "snippet" = "snippet";
  constructor(public snipppet: { html: string; name: string }) {}

  get treeItem(): TreeItem {
    const item = new TreeItem(
      this.snipppet.name,
      TreeItemCollapsibleState.None
    );
    item.contextValue = "snippet";
    item.iconPath = new ThemeIcon("code");
    return item;
  }

  copy() {
    return this.snipppet.html;
  }
}
