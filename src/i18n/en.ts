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
    notification: {
      x2: (ticker: string, rate: number, wallet: string) =>
        `"${ticker}" x${+rate.toFixed(2)} in the wallet "${wallet}".`,
      x05: (ticker: string, rate: number, wallet: string) =>
        `"${ticker}" x${+rate.toFixed(2)} in the wallet "${wallet}".`,
    },
  },
  button: {
    linkWallet: () => 'Connect Wallet',
    link: () => 'Connect',
  },
} as const
