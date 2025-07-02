import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';

import path from 'path';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(''), './src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.mdx', '.json'],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // 可以在这里添加全局 less 变量
        // additionalData: `@import "@/styles/variables.less";`
      },
    },
  },
});
