import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';

let buildModules = 0;
export default defineConfig(({ mode }) => {
  const variables = loadEnv(mode, process.cwd(), '');
  const target = mode === 'design' ? 'http://127.0.0.1:4391' : variables.NIBLEAF_API_URL || variables.VITE_API_URL || 'http://127.0.0.1:4311';
  return {
    resolve: {
      tsconfigPaths: true,
      dedupe: ['react', 'react-dom'],
      alias: [
        { find: /^mermaid$/, replacement: resolve(import.meta.dirname, '.cache/vendor/mermaid.js') },
        { find: /^@scalar\/api-reference-react$/, replacement: resolve(import.meta.dirname, '.cache/vendor/scalar.js') },
        ...['@/shared/i18n', '@cms/i18n'].flatMap((prefix) =>
          ['react', 'site', 'standalone', ''].map((entry) => ({
            find: new RegExp(`^${prefix}${entry ? `/${entry}` : ''}$`),
            replacement: resolve(import.meta.dirname, '.cache/i18n', `${entry || 'index'}.js`),
          })),
        ),
      ],
    },
    server: {
      host: '0.0.0.0',
      port: 4310,
      allowedHosts: ['.e2b.app'],
      proxy: { '/api': { target, changeOrigin: true } },
    },
    build: {
      rolldownOptions: {
        onLog(level, log, handler) {
          if (log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('use client')) return;
          handler(level, log);
        },
      },
    },
    environments: { ssr: { build: { rolldownOptions: { output: { codeSplitting: false } } } } },
    plugins: [
      {
        name: 'app-build-progress',
        transform(_code, id) {
          if (process.env.CMS_BUILD_TRACE) {
            buildModules++;
            if (buildModules % 250 === 0) console.log(`[app build] ${buildModules} modules: ${id}`);
          }
        },
      },
      tailwindcss(),
      nitro({
        ...(mode === 'design'
          ? {
              output: {
                dir: resolve(import.meta.dirname, '.cache/design-output'),
                publicDir: resolve(import.meta.dirname, '.cache/design-output/public'),
                serverDir: resolve(import.meta.dirname, '.cache/design-output/server'),
              },
            }
          : {}),
        routeRules: { '/api/**': { proxy: `${target}/api/**` } },
      }),
      tanstackStart({ router: { routeFileIgnorePattern: String.raw`\.(test|spec)\.` } }),
      react(),
    ],
  };
});
