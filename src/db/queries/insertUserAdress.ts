import { usernames } from "../../db/schema";
import { TDbConnection } from "../../types";

export const insertUserAdress = async (db: TDbConnection, values: typeof usernames.$inferInsert) => {
    await db.insert(usernames).values(values).onConflictDoNothing()
}
