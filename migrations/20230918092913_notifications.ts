import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("notifications", (table) => {
    table.dropForeign(["alertId"])
    table.integer("alertId").unsigned().references("id").inTable("alerts").nullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("notifications", (table) => {
    table.dropForeign(["alertId"])
    table.integer("alertId").unsigned().references("id").inTable("alerts").notNullable().alter()
  })
}
