import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/Introduction.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (viteConfig) => {
    return {
      ...viteConfig,
      resolve: {
        ...viteConfig.resolve,
        alias: [
          ...(Array.isArray(viteConfig.resolve?.alias) ? viteConfig.resolve.alias : []),
          {
            find: /^~(.+)/,
            replacement: path.join(process.cwd(), 'node_modules/$1'),
          },
          {
            find: /^src(.+)/,
            replacement: path.join(process.cwd(), 'src/$1'),
          },
          {
            find: 'src',
            replacement: path.join(process.cwd(), 'src'),
          },
        ],
      },
    };
  },
};

export default config;
