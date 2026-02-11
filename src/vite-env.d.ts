/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_BUGSNAG_API_KEY: string
  readonly VITE_DISCORD_CLIENT_ID: string
  readonly VITE_DISCORD_REDIRECT_URI: string
  readonly VITE_CITIZENID_CLIENT_ID: string
  readonly VITE_CITIZENID_REDIRECT_URI: string
  readonly VITE_CITIZENID_AUTHORIZE_URL: string
  readonly VITE_CITIZENID_TOKEN_URL: string
  readonly VITE_CITIZENID_USERINFO_URL: string
  readonly VITE_CITIZENID_LOGOUT_URL: string
  readonly VITE_VAPID_PUBLIC_KEY: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENVIRONMENT: string
  readonly VITE_SENTRY_RELEASE: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
