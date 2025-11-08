import type { AstroUserConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default {
  site: 'https://docs.reactorbro.com',
  output: 'static',

  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },

  vite: {
    ssr: {
      noExternal: ['@repo/ui', '@repo/tokens'],
    },
  },

  server: {
    port: 4322,
    host: true,
  },
} satisfies AstroUserConfig;
