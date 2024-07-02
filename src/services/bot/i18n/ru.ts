import { getEmojiForWallet } from "../../../utils"

export const ru = {
  message: {
    start: () => `
Привет, я ждал тебя 👋

Вот, что я могу:

- уведомить тебя, когда жетон в кошельке сделает x2 или упадёт в два раза
- помочь тебе увидеть прибыль по всему твоему кошельку или выбранной монете без изучения сложных инструментов

Если возникнут вопросы, задай их в [чате](https://t.me/+prK7rt-771VmZTAy)

Отправьте ваш адрес или привяжите кошелёк 👇
`,
    youNoLongerHaveJetton: (ticker: string) =>
      `Вы больше не холдите $${ticker}, уведомления для этого жетона остановлены`,
    detectedNewJetton: (ticker: string) =>
      `🆕 Обнаружен новый жетон $${ticker}. Вы получите уведомление, когда его цена сделает 2x или упадёт вдвое`,
    notification: {
      x2: (ticker: string, wallet: string) => `📈 Жетон $${ticker} сделал x2! Адрес: ${getEmojiForWallet(wallet)} \`${wallet}\``,
      x05: (ticker: string, wallet: string) =>
        `📉 Жетон $${ticker} подешевел вдвое. Адрес: ${getEmojiForWallet(wallet)} \`${wallet}\``,
    },
    newWalletConnected: (address: string, tickers: string[]) => `
✨ Кошелёк привязан: ${getEmojiForWallet(address)} \`${address}\`

${
  tickers.length
    ? `Ваши токены: ${tickers.reduce((line, ticker) => {
      if (line) return `${line}, $${ticker}`
      return `$${ticker}`
    })}

Я уведомлю вас, когда один из токенов сделает 2x или упадёт в два раза.
`
    : 'Токенов пока нет. Хотите их купить?'
}`,
    walletConnectedAlready: () => `Данный кошелек уже привязан к вашему аккаунту.`,
    error: () => `❌ Что-то пошло не так. Пожалуйста, повторите попытку позже.`,
  },
  button: {
    linkWallet: () => 'Подключить кошелёк',
    link: () => 'Подключить',
  },
} as const
