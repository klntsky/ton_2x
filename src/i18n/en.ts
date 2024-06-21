import type { TI18nLocalization } from './types'

export const en: TI18nLocalization = {
  message: {
    start: () => `
Hello, I've been waiting for you 👋

I'll help you see the profit for your entire wallet (TODO) 👛 or selected coin 💎 without using complicated tools 📱

If you have any questions, feel free to ask them in the [chat](https://t.me/+prK7rt-771VmZTAy) ❤️

Connect your wallet to get started 👇
`,
    youNoLongerHaveJetton: (ticker: string) =>
      `You no longer hold tokens of "${ticker}", notifications for them have been stopped.`,
    detectedNewJetton: (ticker: string) =>
      `A new jetton “${ticker}” has been detected, notifications will now be sent about it.`,
    notification: {
      x2: (ticker: string, wallet: string) => `"${ticker}" made x2! (Wallet "${wallet}")`,
      x05: (ticker: string, wallet: string) =>
        `"${ticker}" has dropped in price by half. (Wallet "${wallet}")`,
    },
  },
  button: {
    linkWallet: () => 'Connect Wallet',
    link: () => 'Connect',
  },
} as const
