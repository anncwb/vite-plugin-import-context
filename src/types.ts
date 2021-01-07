export type RegOptions = string | RegExp | (string | RegExp)[] | null | undefined;

export interface Options {
  include?: RegOptions;
  exclude?: RegOptions;
}
