import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
    const target =
        mode === 'development'
            ? 'http://localhost:5059' // Development backend URL
            : 'http://10.10.1.100:4460'; // Production backend URL

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            proxy: {
                '^/api': {
                    target: target,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
            port: 5173, // Port for Vite dev server
        },
    };
});
