const fs = require('fs');
const path = require('path');

let uid = 0;

function getUID() {
  return uid++;
}

// Synchronous import
function getSyncImport(moduleProps: string) {
  return `
  (function() {
    var map = {
      ${moduleProps}
    };
    var req = function req(key) {
      return map[key] || (function() { throw new Error("Cannot find module '" + key + "'.") }());
    }
    req.keys = function() {
      return Object.keys(map);
    }
    return req;
  })()
`;
}

// dynamic import
function getDynamicImport(keys: string[], files: string[], uid: number, dirname: string) {
  let caseStr = '';
  files.forEach((file) => {
    const moduleAbsolutePath = getModuleAbsolutePath(dirname, file);
    caseStr += `case '${file}': return () => import('${moduleAbsolutePath}');\n\t\t`;
  });
  return `
        (function() {
          var map = [${keys}];
        var dynamicImport = function dynamicImport(key) {
           switch (key) {
          ${caseStr}
          default: return Promise.reject(new Error("Unknown variable dynamic import: " + key));
          }
        }

        dynamicImport.keys = function() {
           return map;
        }
        return dynamicImport;
        })()
    `.replace(',case', 'case');
}

export function resolveImport(files: string[], dirname: string, dynamicImport: boolean) {
  const uid = getUID();
  let importCode = '';
  let moduleProps = '';

  let keys: string[] = [];

  files.forEach((file, index) => {
    const moduleName = getModuleName(uid, index);

    if (!dynamicImport) {
      const moduleAbsolutePath = getModuleAbsolutePath(dirname, file);
      importCode += `import * as ${moduleName} from '${moduleAbsolutePath}';\n`;
    }
    moduleProps += genPropsCode(file, moduleName);
    keys.push(`'${file}'`);
  });

  const importFnCode = dynamicImport
    ? getDynamicImport(keys, files, uid, dirname)
    : getSyncImport(moduleProps);

  return {
    importFnCode,
    importCode,
  };
}

function genPropsCode(key: string, value: string) {
  return `'${key}': ${value},\n`;
}

function getModuleName(uid: number, index: number) {
  return `import_context_module_${uid}_${index}`;
}

function getModuleAbsolutePath(dirname: string, file: string) {
  return path.resolve(dirname, file).replace(/\\/g, '/').replace('.tsx', '');
}

export function resolveDir(
  dirname = './',
  deep = false,
  regexp = /^\.\//,
  ignoreCurrentFile = true,
  id: string
) {
  let files = readDir(dirname, deep);

  if (!Array.isArray(files)) {
    files = [files];
  }
  if (ignoreCurrentFile) {
    files = files.filter((f: string) => f !== id);
  }

  files = files.map((file: string) => `./${path.relative(dirname, file)}`);
  return files.filter((file: string) => {
    const moduleAbsolutePath = getModuleAbsolutePath(dirname, file);
    const isFile = !fs.statSync(moduleAbsolutePath).isDirectory();
    return regexp.test(file.replace(/\\/g, '/')) && isFile;
  });
}

function readDir(dir: string, deep: boolean) {
  const isDirectory = fs.statSync(dir).isDirectory();
  if (deep) {
    return readDirDeep(dir);
  } else if (isDirectory) {
    const files = fs.readdirSync(dir);
    if (files) {
      return files.map((file: string) => path.resolve(dir, file));
    }
  } else {
    return [dir];
  }
}

function readDirDeep(dir: string) {
  const isDir = fs.statSync(dir).isDirectory();
  return isDir
    ? Array.prototype.concat(
        ...fs.readdirSync(dir).map((f: string) => readDirDeep(path.join(dir, f)))
      )
    : dir;
}
