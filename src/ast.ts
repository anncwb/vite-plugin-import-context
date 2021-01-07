import type { BabelFileResult, Node } from '@babel/core';
import path from 'path';
import type { Alias } from 'vite';
import { isArray, isString, isRegExp } from './util';

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
  const body = babelResult.ast?.program?.body ?? [];
  let resList: Record<string, any>[] = [];

  for (const n of body) {
    const node = n as any;

    // expression
    if (node.type === 'VariableDeclaration') {
      const declaration = node.declarations?.[0];

      if (declaration?.type === 'VariableDeclarator') {
        const fnType = declaration?.init?.type;
        if (fnType === 'CallExpression') {
          const expression = declaration?.init;
          if (isImportContextCall(expression)) {
            const args = expression.arguments || [];
            for (const arg of args) {
              const properties = arg?.properties || [];
              const params = getImportContextParams(properties);
              resList.push({
                start: expression.start,
                end: expression.end,
                args: params,
              });
            }
          }
        }
      }
    }
  }
  return resList;
}

// Get function parameters
function getImportContextParams(properties: Node[]) {
  let ret: Record<string, any> = {};
  for (const prop of properties) {
    if (prop.type === 'ObjectProperty') {
      const normalLiteral = ['NullLiteral', 'BooleanLiteral', 'StringLiteral', 'NumericLiteral'];
      const literalList = [...normalLiteral, 'RegExpLiteral'];
      const type = prop.value.type;
      const pattern = (prop.value as any).pattern;
      const value = type === 'RegExpLiteral' ? new RegExp(pattern) : (prop.value as any).value;
      if (literalList.includes(type)) {
        ret[`${(prop.key as any).name}`] = value;
      }
    }
  }
  return ret;
}

function isImportContextCall(node: any) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'importContext'
  );
}
