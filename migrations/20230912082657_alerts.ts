import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.boolean('increase')
    table.boolean('paused')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.dropColumn('increase')
    table.dropColumn('paused')
  })
}
