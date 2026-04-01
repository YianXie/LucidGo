/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module "*.md" {
    import type { FC } from "react";
    const Component: FC;
    export default Component;
}

declare module "*.png" {
    const src: string;
    export default src;
}

declare module "*.wav" {
    const src: string;
    export default src;
}
