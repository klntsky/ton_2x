import { en } from './en'
import { ru } from './ru'
import type { TI18nLocalization } from './types'

export const i18n: (languageCode?: 'ru' | string) => TI18nLocalization = languageCode => {
  return languageCode === 'ru' ? ru : en
}
