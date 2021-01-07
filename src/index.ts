import type { Plugin, ResolvedConfig } from 'vite';
import { createFilter } from 'rollup-pluginutils';

import type { Options } from './types';

import { transformSync } from '@babel/core';

import { parse } from './parse';
// import debug from 'debug';

// const log = debug('vite:import-context');

export default (options: Options = {}): Plugin => {
  let config: ResolvedConfig;

  const filter = createFilter(
    options.include || ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.jsx'],
    options.exclude || 'node_modules/**'
  );
  return {
    name: 'vite:import-context',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async transform(code, id) {
      if (!filter(id) || !/importContext/g.test(code)) return;
      const alias = config.alias;
      const plugins = [];
      if (id.endsWith('.tsx')) {
        plugins.push([
          require('@babel/plugin-transform-typescript'),
          { isTSX: true, allowExtensions: true },
        ]);
      }
      const babelResult = transformSync(code, {
        ast: true,
        plugins,
        sourceMaps: false,
        sourceFileName: id,
      });

      if (!babelResult) {
        return code;
      }

      code = parse(babelResult, code, id, alias);
      return {
        code,
      };
    },
  };
};

export * from './types';
