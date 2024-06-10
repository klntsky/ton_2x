import { Telegraf } from "telegraf";
import { TTelegrafContext } from "../types";

export const sendMessageToBotUsers = async (bot: Telegraf<TTelegrafContext>, text: string) => {
    const ids = [
        100934858,
        1030053323,
        111426986,
        1423937422,
        162832046,
        184452476,
        203901111,
        210120552,
        265010027,
        354240146,
        395066273,
        403500796,
        419271529,
        456037800,
        5138292,
        533183047,
        5972815276,
        6249297860,
        64250488,
        6612433050,
        66647940,
        6755886271,
        712743495,
        731348296,
        982255714,
    ]
    const failedMessages = []
    for (const id of ids) {
        try {
            await bot.telegram.sendMessage(id, text)
        } catch (error) {
            failedMessages.push({
                id,
                error: `${error.name}: ${error.message}`,
            })
        }
    }
    failedMessages.forEach(message => console.log(message.id, message.error))
}
