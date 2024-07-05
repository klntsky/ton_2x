import { getEmojiForWallet } from '../../../utils'
import { jettonNamesWithSpecialCharacters } from '../constants'
import type { TI18nLocalization } from './types'

export const en: TI18nLocalization = {
  message: {
    start: () => `
Hello, I've been waiting for you 👋

What I do:

- I'll notify you whenever a token you hold in your TON wallet makes x2 from the purchase price
- I'll help you see the profit for your entire wallet or selected coin

If you have any questions, feel free to ask in the [chat](https://t.me/+mwwKEfMAbtQ3ZjNi).

Send an address you want to watch or connect your own 👇
`,
    youNoLongerHaveJetton: (ticker: string) =>
      `👋 You no longer hold $${jettonNamesWithSpecialCharacters[ticker] || ticker.toUpperCase()}, notifications for this jetton have been stopped.`,
    detectedNewJetton: (ticker: string) =>
      `💎 New jetton found: $${jettonNamesWithSpecialCharacters[ticker] || ticker.toUpperCase()}. I will notify you when the price moves up or down by 2x.`,
    notification: {
      x2: (ticker: string, wallet: string, price: number | string) => `
📈 $${jettonNamesWithSpecialCharacters[ticker] || ticker.toUpperCase()} made 2x! Wallet:
${getEmojiForWallet(wallet)} \`${wallet}\`
💵 Current price: $${price}
`,
      x05: (ticker: string, wallet: string, price: number | string) => `
📉 $${jettonNamesWithSpecialCharacters[ticker] || ticker.toUpperCase()} has dropped in price by half. Wallet:
${getEmojiForWallet(wallet)} \`${wallet}\`
💵 Current price: $${price}
`,
    },
    newWalletConnected: (address: string, tickers: string) => `
✨ New wallet connected:
${getEmojiForWallet(address)} \`${address}\`

${
  tickers.length
    ? `Tokens held: ${tickers}

I will notify you when any of them makes 2x or loses a half in price.
`
    : 'No tokens found. Buy some?'
}`,
    reachedMaxAmountOfWallets: () =>
      `You have reached the limit on the number of linked wallets (${process.env.LIMIT_WALLETS_FOR_USER})`,
    walletConnectedAlready: () => `This wallet is already linked to your account.`,
    error: () => `❌ Something went wrong.`,
    errorTryToRepeatLater: () => `❌ Something went wrong. Please try again later.`,
    disconnect: {
      message: (disconnectCOmmandList: string) => `
Select wallets that you want to stop watching:

${disconnectCOmmandList}

Or disconnect all wallets using /disconnect\\_all.
`,
      walletDisconnectedSuccessful: (address: string) =>
        `${getEmojiForWallet(address)} Wallet disconnected successfully.`,
      allWalletsDisconnectedSuccessful: () => `All wallets disconnected successfully.`,
      noWallets: () => `You do not have linked wallets.`,
    },
    iDontUnderstand: () => `
I don't understand. You can send me an address to watch, or open the Telegram mini app to view your portfolio performance.    
`,
  },
  button: {
    linkWallet: () => 'Connect Wallet',
    link: () => 'Connect',
  },
  command: {
    disconnect: () => `Menu for unlinking wallets`,
  },
} as const
