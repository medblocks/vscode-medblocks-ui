import * as fs from "fs";
import * as path from "path";
import {transform} from "medblocks-ui/dist/utils";
import type { TransformFunction } from "medblocks-ui/dist/utils";

export function pathExists(p: string): boolean {
  try {
    fs.accessSync(p);
  } catch (err) {
    return false;
  }

  return true;
}

export function getTransform(workspace: string): TransformFunction {
  return transform;
}

export function getExtension(filename: string){
  const extension = path.extname(filename||'').split('.');
  return extension[extension.length - 1];
};