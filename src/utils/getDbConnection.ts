import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'

export const getDbConnection = async () => {
  const db = new PGlite('file://data/postgresql')
  const connection = drizzle(db)
  return connection
}
