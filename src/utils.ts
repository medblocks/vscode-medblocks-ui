import * as fs from 'fs';
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
	const configPath = path.join(workspace, 'medblocksui.config.cjs')
	if (pathExists(configPath)) {
		delete require.cache[configPath]
		const configModule = require(configPath)
		return configModule.default
	}
	return defaultTransform
}