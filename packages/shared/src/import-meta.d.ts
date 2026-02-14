// Minimal typing for `import.meta.env` so workspace packages
// (which are compiled via `tsc -b`, not Vite directly) can still typecheck.

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

