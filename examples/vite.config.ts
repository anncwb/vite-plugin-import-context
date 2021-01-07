import { UserConfigExport } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import dynamicImport from 'vite-plugin-import-context';

export default (): UserConfigExport => {
  return {
    alias: {
      '/@/': `${path.resolve(__dirname, 'src')}/`,
    },
    plugins: [vue(), dynamicImport()],
  };
};
