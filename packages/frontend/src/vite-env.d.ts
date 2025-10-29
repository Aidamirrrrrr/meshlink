interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_SIGNALING_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
