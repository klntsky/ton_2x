import type { TI18nLocalization } from './types'

export const en: TI18nLocalization = {
  message: {
    start: () => `
Hello, I've been waiting for you 👋

What I do:

- I'll notify you whenever a token you hold in your TON wallet makes x2 from the purchase price
- I'll help you see the profit for your entire wallet (TODO) or selected coin

If you have any questions, feel free to ask in the [chat](https://t.me/+mwwKEfMAbtQ3ZjNi)

Connect your wallet to get started 👇
`,
    youNoLongerHaveJetton: (ticker: string) =>
      `You no longer hold $${ticker}, notifications for this jetton have been stopped.`,
    detectedNewJetton: (ticker: string) =>
      `New jetton found: $${ticker}. I will notify you when the price moves up or down by 2x`,
    notification: {
      x2: (ticker: string, wallet: string) => `$${ticker} made 2x! Wallet: \`${wallet}\``,
      x05: (ticker: string, wallet: string) =>
        `$${ticker} has dropped in price by half from the moment you purchased it. Wallet: \`${wallet}\``,
    },
    error: () => `Something went wrong. Please try again later.`,
  },
  button: {
    linkWallet: () => 'Connect Wallet',
    link: () => 'Connect',
  },
} as const
