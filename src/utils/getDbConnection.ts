import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import type { TDbConnection } from '../types'

export const getDbConnection = async () => {
  const db = new PGlite('file://data/postgresql')
  const connection = drizzle(db)

  // @ts-expect-error object restructuring didn't work that easy for types
  connection.close = () => db.close()
  return connection as TDbConnection
}
