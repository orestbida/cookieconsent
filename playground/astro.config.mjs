import { defineConfig } from 'astro/config';
import compress from "astro-compress";
import { buildTranslationsExportFile } from './src/modules/serverUtils';

buildTranslationsExportFile();

export default defineConfig({
  integrations: [compress(), {
    name: 'build-languages',
    hooks: {
      "astro:build:start": async () => {
        buildTranslationsExportFile();
      }
    }
  }],

});