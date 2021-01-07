# vite-plugin-import-context

**English** | [中文](./README.zh_CN.md)

[![npm][npm-img]][npm-url] [![node][node-img]][node-url]

A dynamic import plugin based on vite.Support dynamic import

- 💡 Similar to webpack's require.context
- ⚡️ Support dynamic loading
- 📦 Detailed documentation and examples

### Install (yarn or npm)

**node version:** >=12.0.0

**vite version:** >=2.0.0-beta.12

`yarn add vite-plugin-import-context -D` or `npm i vite-plugin-import-context -D`

**Run Example**

```bash

cd ./examples

yarn install

yarn serve

```

## Usage

- Config plugin in vite.config.ts

```ts
import { UserConfigExport } from 'vite';
import vue from '@vitejs/plugin-vue';

import dynamicImport from '../src/index';

export default (): UserConfigExport => {
  return {
    plugins: [vue(), dynamicImport(/*options*/)],
  };
};
```

- If you are using the `ts` development environment. Then add the type to `tsconfig.json`. The corresponding type definition has been configured

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-import-context/client"]
  }
}
```

### Options Description

| param | type | default | description |
| --- | --- | --- | --- |
| include | `string / RegExp / (string / RegExp)[] / null / undefined` | `['**/*.js', '**/*.ts', '**/*.tsx', '**/*.jsx']` | Code directory and file format to be converted |
| exclude | `string / RegExp / (string / RegExp)[] / null / undefined` | `'node_modules/**'` | Excluded files/folders |

### Usage in Code

In the code, if the keyword function `importContext` appears, it will be transformed by the plugin.

**Please ensure that there are no custom importContext functions or variables in your own code**

### basicExample

This example is non-dynamic import. And no deep recursion

```ts
// xxx.ts

const nextMainModule = importContext({
  dir: './',
  deep: false,
  regexp: /\.ts$/,
  dynamicImport: false,
  ignoreCurrentFile: true,
});

nextMainModule.keys().forEach((key) => {
  console.log('nextMain=>', nextMainModule(key));
});
```

### aliasExample

It can be matched according to the alias of vite

```ts
// xxx.ts

const aliasModule = importContext({
  dir: '/@/views',
  deep: true,
  regexp: /\.ts$/,
});

aliasModule.keys().forEach((key) => {
  console.log('aliasModule=>', aliasModule(key));
});
```

### deepImportExample

This example is non-dynamic import. And deep recursion

```ts
// xxx.ts

const nextMainModule = importContext({
  dir: './',
  deep: true,
  regexp: /\.ts$/,
  dynamicImport: false,
  ignoreCurrentFile: true,
});

nextMainModule.keys().forEach((key) => {
  console.log('nextMain=>', nextMainModule(key));
});
```

### dynamicImportExample

This example is import dynamically. And deep recursion

```ts
const dynamicModule = importContext({
  dir: './',
  deep: true,
  regexp: /\.ts$/,
  dynamicImport: true,
});

dynamicModule.keys().forEach((key: string) => {
  console.log('dynamicModule=>', dynamicModule(key));
  dynamicModule(key)().then((res) => {
    console.log('======================');
    console.log('dynamicModuleRes=>', res);
    console.log('======================');
  });
});
```

## ImportContext Parameter description

deep: false, regexp: /\.ts$/, dynamicImport: false, ignoreCurrentFile: true,

| param | type | default | description |
| --- | --- | --- | --- |
| dir | `string` | `./` | File path to be imported, support alias |
| deep | `boolean` | `false` | Whether to introduce deeply |
| regexp | `regexp` | `/^\.\//` | File matching regular |
| dynamicImport | `boolean` | `false` | Whether to enable dynamic import |
| ignoreCurrentFile | `boolean` | `true` | Whether to ignore the current file. If dir='./', It will import itself, this configuration can ignore the import of itself |

## NOTE

- The plugin draws on the idea of [rollup-plugin-require-context](https://github.com/elcarim5efil/rollup-plugin-require-context)。Because the plug-in does not support dynamic import and ts files.So i finished it
- The function must have a variable to accept the return value of the function. Otherwise it will parse error

## License

MIT

[npm-img]: https://img.shields.io/npm/v/vite-plugin-import-context.svg
[npm-url]: https://npmjs.com/package/vite-plugin-import-context
[node-img]: https://img.shields.io/node/v/vite-plugin-import-context.svg
[node-url]: https://nodejs.org/en/about/releases/
