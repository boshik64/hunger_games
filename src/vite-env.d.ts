/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_TICKETS_URL: string;
  readonly VITE_ANALYTICS_ID: string;
  readonly VITE_ANALYTICS_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
