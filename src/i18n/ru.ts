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
    detectedNewJetton: (ticker: string) =>
      `Обнаружен новый жетон «${ticker}», теперь о нем будут приходить уведомления.`,
    notification: {
      x2: (ticker: string, wallet: string) => `«${ticker}» сделал x2! (Кошелек «${wallet}»)`,
      x05: (ticker: string, wallet: string) => `«${ticker}» подешевел вдвое. (Кошелек «${wallet}»)`,
    },
  },
  button: {
    linkWallet: () => 'Подключить кошелёк',
    link: () => 'Подключить',
  },
} as const
