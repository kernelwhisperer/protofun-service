import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.bigint('createdAt')
    table.bigint('updatedAt')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.dropColumn('createdAt')
    table.dropColumn('updatedAt')
  })
}
