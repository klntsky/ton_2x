import { usernames } from "../../db/schema";
import { TDbConnection } from "../../types";

export const insertUserAdress = async (db: TDbConnection, userId: number, address: string) => {
    await db.insert(usernames).values({
        userId,
        address,
    })
}
