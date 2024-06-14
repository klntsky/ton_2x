import { ru } from '../ru'

import { TDeepTypeInObject } from '../../types'

export type TI18nLocalization = TDeepTypeInObject<typeof ru, () => string>
