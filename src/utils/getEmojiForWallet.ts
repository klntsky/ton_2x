import { emojiList } from "../constants"

export const getEmojiForWallet = (address: string): string => {
  const emojiArray = emojiList
  const hashCode = address.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)

  const emojiIndex = hashCode % emojiArray.length
  return emojiArray[emojiIndex]
}
