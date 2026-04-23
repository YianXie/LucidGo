import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: "automatic",
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "react/jsx-runtime": path.resolve(
                __dirname,
                "./node_modules/react/jsx-runtime.js"
            ),
        },
    },
    build: {
        rollupOptions: {
            external: [],
        },
        commonjsOptions: {
            include: [/node_modules/],
            transformMixedEsModules: true,
        },
    },
    optimizeDeps: {
        include: ["react", "react-dom", "react/jsx-runtime"],
    },
    assetsInclude: ["**/*.md"],
});
