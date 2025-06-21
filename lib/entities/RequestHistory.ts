import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class RequestHistory {
  @PrimaryKey()
  id!: number

  @Property()
  method!: string

  @Property()
  url!: string

  @Property({ type: "text" })
  headers!: string

  @Property({ type: "text" })
  body!: string

  @Property({ type: "text" })
  response!: string

  @Property()
  statusCode!: number

  @Property()
  responseTime!: number

  @Property()
  createdAt!: Date
}
