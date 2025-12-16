/* eslint-disable no-undef */
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            // Ensure React plugin processes JSX properly
            jsxRuntime: "automatic",
        }),
        tailwindcss(),
        mdx({
            // Process MDX files - use glob patterns that work from the frontend directory
            include: [
                "**/*.{mdx,md}",
                path.resolve(__dirname, "../docs/**/*.{mdx,md}"),
                path.resolve(__dirname, "../articles/**/*.{mdx,md}"),
            ],
            // Use React's JSX runtime
            jsxImportSource: "react",
        }),
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
            // Ensure React and jsx-runtime are not externalized
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
});
