import { TDbConnection } from "../../types";
import { tokens } from "../schema";

export const insertToken = async (db: TDbConnection, values: typeof tokens.$inferInsert) => {
    await db.insert(tokens).values(values).onConflictDoNothing()
}
