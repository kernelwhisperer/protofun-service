import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.string('startValue')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.dropColumn('startValue')
  })
}
