/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
