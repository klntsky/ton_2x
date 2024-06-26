import type { TI18nLocalization } from '../../i18n/types'

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: TI18nLocalization
    }
  }
}
