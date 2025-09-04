/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  readonly VITE_APPWRITE_DB_ID: string
  readonly VITE_APPWRITE_USERS_COLLECTION_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

