import type { TI18nLocalization } from './types'

export const en: TI18nLocalization = {
  message: {
    start: () => `
Hello, I've been waiting for you 👋

What I do:

- I'll notify you whenever a token you hold in your TON wallet makes x2 from the purchase price
- I'll help you see the profit for your entire wallet or selected coin

If you have any questions, feel free to ask in the [chat](https://t.me/+mwwKEfMAbtQ3ZjNi)

Send an address you want to watch or connect your own 👇
`,
    youNoLongerHaveJetton: (ticker: string) =>
      `You no longer hold $${ticker}, notifications for this jetton have been stopped.`,
    detectedNewJetton: (ticker: string) =>
      `🆕 New jetton found: $${ticker}. I will notify you when the price moves up or down by 2x`,
    notification: {
      x2: (ticker: string, wallet: string) => `📈 $${ticker} made 2x! Wallet: \`${wallet}\``,
      x05: (ticker: string, wallet: string) =>
        `📉 $${ticker} has dropped in price by half from the moment you purchased it. Wallet: \`${wallet}\``,
    },
    newWalletConnected: (address: string, tickers: string[]) => `
✨ New wallet connected: \`${address}\`

${
  tickers.length
    ? `Tokens held: ${tickers.reduce((line, ticker) => {
      if (line) return `${line}, $${ticker}`
      return `$${ticker}`
    })}
s
I will notify you when any of them makes 2x or loses a half in price.
`
    : 'No tokens found. Buy some?'
}`,
    walletConnectedAlready: () => `This wallet is already linked to your account`,
    error: () => `❌ Something went wrong. Please try again later.`,
  },
  button: {
    linkWallet: () => 'Connect Wallet',
    link: () => 'Connect',
  },
} as const
