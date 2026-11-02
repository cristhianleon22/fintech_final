import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        clearMocks: true,
        include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/use-cases/**/*.ts', 'src/domain/**/*.ts'],
            exclude: ['src/**/*.d.ts'],
        },
    },
    resolve: {
        alias: {
            '@domain': path.resolve(import.meta.url, './src/domain'),
            '@use-cases': path.resolve(import.meta.url, './src/use-cases'),
            '@infrastructure': path.resolve(import.meta.url, './src/infrastructure'),
        },
    },
});