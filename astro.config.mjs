// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Change this to the *.netlify.app URL while testing, then back to https://jlp.blue.
export const SITE = 'https://jlp.blue';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  integrations: [sitemap()],
});
