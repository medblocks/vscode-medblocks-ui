import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import defaultTransform from './defaultTransform'
import type { TransformFunction } from './defaultTransform'


export function pathExists(p: string): boolean {
	try {
		fs.accessSync(p);
	} catch (err) {
		return false;
	}

	return true;
}



export function getTransform(workspace: string): TransformFunction {
	const configPath = path.join(workspace, 'medblocksui.config.js')

	try {
		delete require.cache[configPath]
		const configModule = require(configPath)
		return configModule.default
	} catch (e) {
		vscode.window.showErrorMessage("Error on loading medblocksui.config.js. Loading default config.")
		return defaultTransform
	}
}