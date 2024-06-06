type EnvKeys =
| 'TELEGRAM_BOT_TOKEN'
| 'TELEGRAM_BOT_WEBHOOK_DOMAIN'
| 'TELEGRAM_BOT_WEBHOOK_PORT'
| 'TELEGRAM_BOT_WEBHOOK_PATH'

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<EnvKeys, string> {}
  }
}

export {}