import * as vscode from 'vscode';
import * as path from 'path';
import defaultTransform from './defaultTransform'
import type { TransformFunction } from './defaultTransform'

export const getTransform = (workspace: string): TransformFunction => {
	const configPath = path.join(workspace, 'medblocksui.config.js')
	try {
		const configModule = require(configPath)
		return configModule.default
	} catch (e) {
		console.debug(e)
		return defaultTransform
	}
}