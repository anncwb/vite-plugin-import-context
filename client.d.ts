declare interface ImportContextResult {
  (key: string): any;
  keys: () => string[];
  [key: string]: any;
}

declare interface DynamicImportContextResult {
  (key: string): () => Promise<any>;
  keys: () => string[];
  [key: string]: any;
}

declare interface ImportContextOptions {
  /**
   * Imported folder
   * @default ./
   */
  dir: string;
  /**
   * Deep match file
   * @default false
   */
  deep?: boolean;
  /**
   * Matching file regular
   * @default /^\.\//
   */
  regexp?: RegExp;
  /**
   * Whether to enable dynamic import
   * @default false
   */
  dynamicImport?: boolean;
  /**
   * Whether to ignore the current file
   * @default true
   */
  ignoreCurrentFile?: boolean;

  customTransform?: () => void;
}

declare function importContext<
  T extends ImportContextOptions & {
    dynamicImport: true;
  }
>(options: T): DynamicImportContextResult;

declare function importContext<
  T extends ImportContextOptions & {
    dynamicImport: false;
  }
>(options: T): ImportContextResult;

declare function importContext<T = ImportContextOptions>(options: T): ImportContextResult;
