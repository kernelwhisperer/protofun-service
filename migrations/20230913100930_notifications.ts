import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex("notifications").del()

  await knex.schema.alterTable("notifications", (table) => {
    table
      .integer("userId")
      .unsigned()
      .references("id")
      .inTable("users")
      .notNullable()
      .onDelete("CASCADE")
    table.integer("alertId").unsigned().references("id").inTable("alerts").notNullable()
    table.bigint("createdAt")
    table.bigint("updatedAt")
    table.boolean("archived")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("notifications", (table) => {
    table.dropForeign(["userId"])
    table.dropForeign(["alertId"])
    table.dropColumn("createdAt")
    table.dropColumn("updatedAt")
    table.dropColumn("archived")
  })
}
