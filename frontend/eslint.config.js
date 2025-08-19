import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
    pluginReact.configs.flat.recommended,
    {
        files: ["**/*.{js,jsx}"],
        extends: ["js/recommended"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            react,
            js,
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "no-unused-vars": "warn",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
]);
