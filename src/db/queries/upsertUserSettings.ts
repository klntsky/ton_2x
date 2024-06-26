import type { TDbConnection } from "../../types"
import { userSettings } from "../schema"

export const upsertUserSettings = (db: TDbConnection, values: typeof userSettings.$inferInsert) => {
  return db.insert(userSettings).values(values).onConflictDoUpdate({
    target: userSettings.languageCode,
    set: { languageCode: values.languageCode },
  })
}
