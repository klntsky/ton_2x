import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'

export const getDbConnection = async () => {
  const pglite = new PGlite('./main.db')
  const connection = drizzle(pglite)
  return {
    connection,
    [Symbol.asyncDispose]: async () => {
      if (pglite.closed) {
        return
      }
      await pglite.close()
    },
  }
}
