import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    esbuildOptions(options, context) {
      if (context.format === 'cjs') {
        options.footer = {
          js: 'module.exports = Object.assign(module.exports.default || module.exports.Favico, module.exports);'
        };
      }
    }
  },
  {
    entry: { 'favico.global': 'src/index.ts' },
    format: ['iife'],
    globalName: 'FavicoGlobal',
    minify: false,
    sourcemap: true,
    target: 'es2022',
    outExtension: () => ({ js: '.js' }),
    esbuildOptions(options) {
      options.footer = {
        js: 'var Favico = FavicoGlobal.default || FavicoGlobal.Favico;'
      };
    }
  },
  {
    entry: { 'favico.global.min': 'src/index.ts' },
    format: ['iife'],
    globalName: 'FavicoGlobal',
    minify: true,
    sourcemap: true,
    target: 'es2022',
    outExtension: () => ({ js: '.js' }),
    esbuildOptions(options) {
      options.footer = {
        js: 'var Favico = FavicoGlobal.default || FavicoGlobal.Favico;'
      };
    }
  }
]);
