type EnvKeys =
  | 'TELEGRAM_BOT_TOKEN'
  | 'TELEGRAM_BOT_WEBHOOK_DOMAIN'
  | 'TELEGRAM_BOT_WEBHOOK_PORT'
  | 'TELEGRAM_BOT_WEBHOOK_PATH'
  | 'TELEGRAM_BOT_WEB_APP'
  | 'EXPRESS_PORT'
  | 'NOTIFICATION_RATE_UP'
  | 'NOTIFICATION_RATE_DOWN'

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<EnvKeys, string> {}
  }
}

export {}
