export const ru = {
  message: {
    start: () => `
Привет, я ждал тебя 👋

Вот, что я могу:

- уведомить тебя, когда жетон в кошельке сделает x2 или упадёт в два раза
- помочь тебе увидеть прибыль по всему твоему кошельку (TODO) или выбранной монете без изучения сложных инструментов

Если возникнут вопросы, задай их в [чате](https://t.me/+prK7rt-771VmZTAy)

Подключи кошелек, чтобы начать 👇
`,
    youNoLongerHaveJetton: (ticker: string) =>
      `Вы больше не холдите $${ticker}, уведомления для этого жетона остановлены`,
    detectedNewJetton: (ticker: string) =>
      `Обнаружен новый жетон $${ticker}. Вы получите уведомление, когда его цена сделает 2x или упадёт вдвое`,
    notification: {
      x2: (ticker: string, wallet: string) => `Жетон $${ticker} сделал x2! адрес: \`${wallet}\``,
      x05: (ticker: string, wallet: string) => `Жетон $${ticker} подешевел вдвое. адрес: \`${wallet}\``,
    },
  },
  button: {
    linkWallet: () => 'Подключить кошелёк',
    link: () => 'Подключить',
  },
} as const
