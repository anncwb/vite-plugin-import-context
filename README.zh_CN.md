# vite-plugin-import-context

**中文** | [English](./README.md)

[![npm][npm-img]][npm-url] [![node][node-img]][node-url]

基于 vite 的动态导入插件，支持动态导入。

- 💡 类似于 webpack 的 require.context
- ⚡️ 支持动态加载
- 📦 详细的文档和示例

### 安装 (yarn or npm)

**node version:** >=12.0.0

**vite version:** >=2.0.0-beta.12

`yarn add vite-plugin-import-context -D` or `npm i vite-plugin-import-context -D`

**运行示例**

```bash

cd ./examples

yarn install

yarn serve

```

## 使用

- 配置 vite.config.ts

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

- 如果您正在使用`ts`开发环境。 然后将类型添加到`tsconfig.json`。 相应的类型定义已配置

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-import-context/client"]
  }
}
```

### 选项说明

| param | type | default | description |
| --- | --- | --- | --- |
| include | `string / RegExp / (string / RegExp)[] / null / undefined` | `['**/*.js', '**/*.ts', '**/*.tsx', '**/*.jsx']` | 包含的文件格式 |
| exclude | `string / RegExp / (string / RegExp)[] / null / undefined` | `'node_modules/**'` | 排除的的文件/文件夹 |

### 在代码内使用

在代码中，如果出现关键字函数`importContext`，它将由插件转换。

**请保证在您自己的代码中没有自定义 importContext 函数或变量**

### basicExample

此示例是非动态导入。 而且没有深度递归

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

可以根据 vite 的别名进行匹配

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

此示例是非动态导入。 和深度递归

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

本示例是动态导入的且深度递归

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

## ImportContext 参数说明

| param | type | default | description |
| --- | --- | --- | --- |
| dir | `string` | `./` | 导入文件路径，支持别名 |
| deep | `boolean` | `false` | 是否深入导入 |
| regexp | `regexp` | `/^\.\//` | 正则文件匹配 |
| dynamicImport | `boolean` | `false` | 是否启用动态导入 |
| ignoreCurrentFile | `boolean` | `true` | 是否忽略当前文件。 如果 dir =`./`，它将自我导入，此配置可以忽略自身的导入 |

## NOTE

-该插件借鉴了[rollup-plugin-require-context](https://github.com/elcarim5efil/rollup-plugin-require-context)的思想。因为该插件不支持动态导入和 ts 文件

- importContext 函数必须具有要接受函数返回值的变量。 否则它将解析错误

## License

MIT

[npm-img]: https://img.shields.io/npm/v/vite-plugin-import-context.svg
[npm-url]: https://npmjs.com/package/vite-plugin-import-context
[node-img]: https://img.shields.io/node/v/vite-plugin-import-context.svg
[node-url]: https://nodejs.org/en/about/releases/
