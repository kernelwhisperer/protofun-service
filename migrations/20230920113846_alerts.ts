import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("alerts", (table) => {
    table.integer("priceUnitIndex")
    table.integer("variantIndex")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("alerts", (table) => {
    table.dropColumn("priceUnitIndex")
    table.dropColumn("variantIndex")
  })
}
