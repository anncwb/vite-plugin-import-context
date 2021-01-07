import type { BabelFileResult } from '@babel/core';
import { Alias } from 'vite';

import { compilerResult } from './ast';
import { resolveDir, resolveImport } from './resolve';

export function parse(babelResult: BabelFileResult, code: string, id: string, alias: Alias[]) {
  const resultData = compilerResult(babelResult, id, alias);
  let head = '';
  const body = resultData.reduceRight((res, data) => {
    const { regexp, start, end, deep, dirname, dynamicImport, ignoreCurrentFile } = data;

    const files = resolveDir(dirname, deep, regexp, ignoreCurrentFile, id);

    const { importCode, importFnCode } = resolveImport(files, dirname, dynamicImport);

    head += importCode;
    res = [res.slice(0, start), importFnCode, res.slice(end)].join('');
    return res;
  }, code);

  return [head, body].join('\n');
}
