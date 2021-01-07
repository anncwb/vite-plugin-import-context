import { UserConfigExport } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import dynamicImport from '../src';

export default (): UserConfigExport => {
  return {
    alias: {
      '/@/': `${path.resolve(__dirname, 'src')}/`,
    },
    plugins: [vue(), dynamicImport()],
  };
};
