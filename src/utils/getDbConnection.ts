import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { TDbConnection } from '../types'

export const getDbConnection = async () => {
  const db = postgres({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    db: process.env.POSTGRES_DATABASE!,
  })
  const connection = drizzle(db, {
    // logger: true,
  })

  // @ts-expect-error object restructuring didn't work that easy for types
  connection.close = () => db.close()
  return connection as TDbConnection
}
