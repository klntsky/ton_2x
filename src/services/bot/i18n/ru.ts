import { getEmojiForWallet } from '../../../utils'
import { jettonNamesWithSpecialCharacters } from '../constants'

export const ru = {
  message: {
    start: () => `
Привет, я ждал тебя 👋

Вот, что я могу:

- уведомить тебя, когда жетон в кошельке сделает x2 или упадёт в два раза
- помочь тебе увидеть прибыль по всему твоему кошельку или выбранной монете без изучения сложных инструментов

Если возникнут вопросы, задай их в [чате](https://t.me/+prK7rt-771VmZTAy).

Отправьте ваш адрес или привяжите кошелёк 👇
`,
    youNoLongerHaveJetton: (ticker: string) =>
      `👋 Вы больше не холдите $${jettonNamesWithSpecialCharacters[ticker] || ticker.toUpperCase()}, уведомления для этого жетона остановлены.`,
    detectedNewJetton: (ticker: string, wallet: string, price: number | string) => `
💎 Обнаружен новый жетон $${jettonNamesWithSpecialCharacters[ticker] || ticker.toUpperCase()}. Кошелёк:
${getEmojiForWallet(wallet)} \`${wallet}\`
💵 Актуальная цена: $${price}
📢 Вы получите уведомление, когда его цена сделает 2x или упадёт вдвое.
`,
    notification: {
      x2: (ticker: string, wallet: string, price: number | string) => `
🚀 Жетон $${jettonNamesWithSpecialCharacters[ticker] || ticker.toUpperCase()} сделал x2! Адрес:
${getEmojiForWallet(wallet)} \`${wallet}\`
💵 Актуальная цена: $${price}`,
      x05: (ticker: string, wallet: string, price: number | string) => `
📉 Жетон $${jettonNamesWithSpecialCharacters[ticker] || ticker.toUpperCase()} подешевел вдвое. Адрес:
${getEmojiForWallet(wallet)} \`${wallet}\`
💵 Актуальная цена: $${price}`,
    },
    newWalletConnected: (address: string, tickers: string) => `
✨ Кошелёк привязан:
${getEmojiForWallet(address)} \`${address}\`

${
  tickers.length
    ? `Ваши токены: ${tickers}

Я уведомлю вас, когда один из токенов сделает 2x или упадёт в два раза.
`
    : 'Токенов пока нет. Хотите их купить?'
}`,
    reachedMaxAmountOfWallets: () =>
      `Вы достигли лимита на количество привязанных кошельков (${process.env.LIMIT_WALLETS_FOR_USER})`,
    walletConnectedAlready: () => `Данный кошелек уже привязан к вашему аккаунту.`,
    error: () => `❌ Что-то пошло не так.`,
    errorTryToRepeatLater: () => `❌ Что-то пошло не так. Пожалуйста, повторите попытку позже.`,
    disconnect: {
      message: (disconnectCOmmandList: string) => `
Выберите, какие адреса вы хотите отвязать:

${disconnectCOmmandList}

Или отвяжите все адреса сразу, используя /disconnect\\_all\\.
`,
      walletDisconnectedSuccessful: (address: string) =>
        `${getEmojiForWallet(address)} Кошелек успешно отключен.`,
      allWalletsDisconnectedSuccessful: () => `Все кошельки успешно отключены.`,
      noWallets: () => `У вас нет привязанных кошельков.`,
    },
    iDontUnderstand: () => `
Я не понимаю. Вы можете отправить мне TON-адрес для наблюдения или открыть портфолио в мини-приложении Телеграм.    
`,
  },
  button: {
    linkWallet: () => 'Подключить кошелёк',
    link: () => 'Подключить',
  },
  command: {
    disconnect: () => `Меню отвязки кошельков`,
  },
} as const
