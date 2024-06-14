import type { ru } from '../ru'

import type { TDeepTypeInObject } from '../../types'

export type TI18nLocalization = TDeepTypeInObject<typeof ru, () => string>
