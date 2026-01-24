import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                sidepanel: resolve(__dirname, 'sidepanel.html'),
                background: resolve(__dirname, 'src/background.ts'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
        outDir: 'dist',
        emptyOutDir: true,
    },
});
