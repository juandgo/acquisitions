import { defineConfig } from 'astro/config';
import arcjet from '@arcjet/astro';
// https://astro.build/config
export default defineConfig({
  integrations: [arcjet()]
});