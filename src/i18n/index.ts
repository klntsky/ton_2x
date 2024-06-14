import { en } from './en'
import { ru } from './ru'
import type { TI18nLocalization } from './types'

export const i18n: Record<'en' | 'ru', TI18nLocalization> = {
  ru,
  en,
}
