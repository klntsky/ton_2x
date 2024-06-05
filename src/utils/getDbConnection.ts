import Database from 'libsql'
import { drizzle } from 'drizzle-orm/libsql'

export const getDbConnection = async () => {
    const libsql = new Database('main.db')
    const db = drizzle(libsql)
    return db
}
