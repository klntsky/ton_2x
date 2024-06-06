import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

export const getDbConnection = async () => {
    const libsql = new Database('main.db')
    const db = drizzle(libsql)
    return db
}
