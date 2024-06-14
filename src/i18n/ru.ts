export const ru = {
  message: {
    start: () => `
Привет, я ждал тебя 👋

Помогу тебе увидеть прибыль по всему твоему кошельку (TODO) 👛 или выбранной монете 💎 без изучения сложных инструментов 📱

Если у тебя возникнут какие-то вопросы, не стесняйся задавать их в [чате](https://t.me/+prK7rt-771VmZTAy) ❤️

Подключи кошелек, чтобы начать 👇
`,
    youNoLongerHaveJetton: (ticker: string) =>
      `Вы больше не холдите жетоны «${ticker}», уведомления по ним остановлены.`,
    notification: {
      x2: (ticker: string, rate: number, wallet: string) =>
        `«${ticker}» x${+rate.toFixed(2)} на кошельке «${wallet}».`,
      x05: (ticker: string, rate: number, wallet: string) =>
        `«${ticker}» x${+rate.toFixed(2)} на кошельке «${wallet}».`,
    },
  },
  button: {
    linkWallet: () => 'Подключить кошелёк',
    link: () => 'Подключить',
  },
} as const
