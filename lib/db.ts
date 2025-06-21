import { MikroORM } from "@mikro-orm/core"
import { SqliteDriver } from "@mikro-orm/sqlite"
import { RequestHistory } from "./entities/RequestHistory"

export const DI = {} as {
  orm: MikroORM
  em: ReturnType<typeof DI.orm.em>
}

export async function initORM() {
  if (DI.orm) {
    return DI.orm
  }

  DI.orm = await MikroORM.init({
    driver: SqliteDriver,
    dbName: "./rest-client.db",
    entities: [RequestHistory],
    debug: process.env.NODE_ENV === "development",
    allowGlobalContext: true,
  })

  DI.em = DI.orm.em

  // Create schema if it doesn't exist
  const generator = DI.orm.getSchemaGenerator()
  await generator.updateSchema()

  return DI.orm
}

// Initialize ORM when the module is loaded
initORM().catch(console.error)
