import type { TDeepTypeInObject } from '../../../../types'
import type { ru } from '../ru'

export type TI18nLocalization = TDeepTypeInObject<typeof ru, () => string>
