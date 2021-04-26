"use strict";

import * as vscode from "vscode";

import { TemplateTreeProvider, TemplateSnippetItem } from "./templateTree";
import { TemplateItem } from "./templateItem";
import { getTransform } from "./utils";
export async function activate(context: vscode.ExtensionContext) {
  const configuration = await getTransform(vscode.workspace.rootPath);
  const templateTree = new TemplateTreeProvider(
    vscode.workspace.rootPath,
    configuration
  );
  vscode.window.registerTreeDataProvider("templateTree", templateTree);
  vscode.commands.registerCommand("templateTree.refreshEntry", () => {
    templateTree.refreshConfig();
    templateTree.refresh();
  });

  vscode.commands.registerCommand(
    "templateTree.copy",
    async (node: TemplateSnippetItem) => {
      vscode.env.clipboard.writeText(node.copy());
      if (node.type === "templateItem") {
        vscode.window.showInformationMessage(`Copied ${node.displayLabel}.`);
      } else {
        vscode.window.showInformationMessage(
          `Copied snippet ${node.snipppet.name}.`
        );
      }
    }
  );
  vscode.commands.registerCommand(
    "templateTree.copyId",
    (node: TemplateItem) => {
      vscode.env.clipboard.writeText(node.tree.id);
      vscode.window.showInformationMessage(`Copied ID of ${node.displayLabel}`);
    }
  );

  vscode.commands.registerCommand(
    "templateTree.copyAql",
    (node: TemplateItem) => {
      vscode.env.clipboard.writeText(node.tree.aqlPath);
      vscode.window.showInformationMessage(
        `Copied AQL of ${node.displayLabel}.`
      );
    }
  );
  vscode.commands.registerCommand(
    "templateTree.copyContext",
    (node: TemplateItem) => {
      vscode.env.clipboard.writeText(node.getContext());
      vscode.window.showInformationMessage(`Copied ${node.displayLabel}.`);
    }
  );
  vscode.commands.registerCommand(
    "templateTree.copyPath",
    (node: TemplateItem) => {
      vscode.env.clipboard.writeText(node.tree.path);
      vscode.window.showInformationMessage(
        `Copied path for ${node.displayLabel}.`
      );
    }
  );

  vscode.commands.registerCommand(
    "templateTree.copyRegex",
    (node: TemplateItem) => {
      vscode.env.clipboard.writeText(node.getRegex());
      vscode.window.showInformationMessage(
        `Copied Regex for ${node.displayLabel}.`
      );
    }
  );

  vscode.workspace.onDidChangeTextDocument(() => {
    templateTree.setCurrentTextFile(
      vscode.window.activeTextEditor?.document.getText()
    );
    templateTree.refresh();
  });

  vscode.window.onDidChangeActiveTextEditor(() => {
    templateTree.setCurrentTextFile(
      vscode.window.activeTextEditor?.document.getText()
    );
    templateTree.refresh();
  });
}
