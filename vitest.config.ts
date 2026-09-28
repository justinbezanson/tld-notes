import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
            '@data': fileURLToPath(
                new URL('./resources/data', import.meta.url),
            ),
        },
    },
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        include: ['resources/js/**/*.spec.ts'],
        setupFiles: ['./resources/js/test/setup.ts'],
    },
});
