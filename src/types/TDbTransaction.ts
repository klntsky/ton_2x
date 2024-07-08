import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'

export type TDbTransaction = PgTransaction<
PostgresJsQueryResultHKT,
Record<string, never>,
ExtractTablesWithRelations<Record<string, never>>
>
