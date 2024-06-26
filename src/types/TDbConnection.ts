import type { PgliteDatabase } from 'drizzle-orm/pglite'

export type TDbConnection = PgliteDatabase & {
  close: () => Promise<void>
}
