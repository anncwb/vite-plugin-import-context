import { createApp } from 'vue';
import App from './App.vue';

console.log('==================================');
console.log('=======NORMAL IMPORT==============');
console.log('==================================');

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

console.log('==================================');
console.log('=======Alias IMPORT==============');
console.log('==================================');

const aliasModule = importContext({
  dir: '/@/views',
  deep: true,
  regexp: /\.ts$/,
});

aliasModule.keys().forEach((key) => {
  console.log('aliasModule=>', aliasModule(key));
});

console.log('==================================');
console.log('=======DEEP IMPORT================');
console.log('==================================');

const subModule = importContext({
  dir: './',
  deep: true,
  regexp: /\.ts$/,
});

subModule.keys().forEach((key) => {
  console.log('subModule=>', subModule(key));
});

console.log('==================================');
console.log('=======DYNAMIC IMPORT==============');
console.log('==================================');

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

createApp(App).mount('#app');
