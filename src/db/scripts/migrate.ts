import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as schema from '../schema'

const db = postgres({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  db: process.env.POSTGRES_DATABASE!,
})

const main = async () => {
  const connection = drizzle(db, { schema })

  await migrate(connection, { migrationsFolder: './src/db/migrations' })
  await db.end()
}

main()
