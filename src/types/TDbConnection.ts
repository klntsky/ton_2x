import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

export type TDbConnection = PostgresJsDatabase & {
  close: () => Promise<void>
}
