import fs from 'fs'
import { createHash } from 'node:crypto'
import { bigint, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { eq } from 'drizzle-orm'

const migrationsDirectory = './src/db/migrations'

const createDrizzleMigrationsTable = `
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"timestamp" bigint NOT NULL,
	CONSTRAINT "__drizzle_migrations_hash_unique" UNIQUE("hash")
);`

const drizzleMigrations = pgTable('__drizzle_migrations', {
  id: serial('id').primaryKey(),
  hash: text('hash').unique().notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
})

export const applyMigrations = async () => {
  const database = new PGlite('file://data/postgresql')
  const db = drizzle(database)
  await database.query(createDrizzleMigrationsTable)
  const migrations = fs.readdirSync(migrationsDirectory).sort()
  for (const migration of migrations) {
    if (!/\.sql$/.test(migration)) continue
    const migrationPath = `${migrationsDirectory}/${migration}`
    const migrationData = fs.readFileSync(migrationPath)
    const hash = createHash('sha256').update(migrationData).digest('hex')
    const [migrationHashInDb] = await db
      .select()
      .from(drizzleMigrations)
      .where(eq(drizzleMigrations.hash, hash))
    if (migrationHashInDb) {
      console.log(`«${migration}» already applied`)
      continue
    }
    const migrationQueries = migrationData.toString().split('--> statement-breakpoint')
    for (const query of migrationQueries) {
      await database.query(query)
    }
    await db.insert(drizzleMigrations).values({
      hash,
      timestamp: Date.now(),
    })
  }
  await database.close()
}

applyMigrations()
