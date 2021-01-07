import type { BabelFileResult } from '@babel/core';
import path from 'path';
import type { Alias } from 'vite';
import { isArray, isString, isRegExp } from './util';

import traverse from '@babel/traverse';
export interface CompilerResult {
  dirname: string;
  deep: boolean;
  regexp: RegExp;
  start: number;
  end: number;
  dynamicImport: boolean;
  ignoreCurrentFile: boolean;
}

function parseAlias(alias: Alias[], dir: string) {
  let realDir: string = dir;
  let match = false;

  if (isArray(alias)) {
    for (let index = 0; index < alias.length; index++) {
      const { find, replacement } = alias[index];
      // The first one is built in vite
      // ignore
      if (index === 0) continue;
      if (isString(find)) {
        if (dir.startsWith(find)) {
          realDir = dir.replace(new RegExp(`^${find}`), replacement);
          match = true;
        }
      } else if (isRegExp(find)) {
        realDir = dir.replace(find, replacement);
        match = true;
      }
    }
  }
  return {
    realDir,
    match,
  };
}

export function compilerResult(
  babelResult: BabelFileResult,
  id: string,
  alias: Alias[]
): CompilerResult[] {
  const expressionResult = extractExpression(babelResult) || [];

  const currentCodeDirName = path.dirname(id);
  return expressionResult.map((er) => {
    const { start, end, args } = er;
    const {
      dir = './',
      deep = false,
      regexp = /^\.\//,
      dynamicImport = false,
      ignoreCurrentFile = true,
    } = args;

    const { realDir, match } = parseAlias(alias, dir);
    const dirname = match ? realDir : path.join(currentCodeDirName, dir);
    return {
      dirname,
      deep,
      regexp,
      start,
      end,
      dynamicImport,
      ignoreCurrentFile,
    };
  });
}

function extractExpression(babelResult: BabelFileResult) {
  let resList: Record<string, any>[] = [];

  traverse(babelResult.ast, {
    CallExpression(path) {
      const node = path.node;
      const { start, end } = node;
      if (node.callee.type === 'Identifier' && node.callee.name === 'importContext') {
        const ret: Record<string, any> = {};
        node.arguments.map((item) => {
          if (item.type === 'ObjectExpression') {
            item.properties.forEach((p) => {
              if (p.type === 'ObjectProperty') {
                const type = p.value.type;
                const pattern = (p.value as any).pattern;

                const value =
                  type === 'RegExpLiteral' ? new RegExp(pattern) : (p.value as any).value;
                ret[`${(p.key as any).name}`] = value;
              }
              return null;
            });
          }
        });
        resList.push({
          start: start,
          end: end,
          args: ret,
        });
      }
    },
  });

  return resList;
}
