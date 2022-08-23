/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ImportMeta {
    env: {
      VITE_WEATHER_API_KEY: string
      VITE_API_KEY: string
      VITE_AUTH_DOMAIN: string
      VITE_PROJECT_ID: string
      VITE_STORAGE_BUCKET: string
      VITE_MESSAGING_SENDER_ID: string
      VITE_APP_ID: string
      VITE_MEASUREMENT_ID: string
    }
  }
}
