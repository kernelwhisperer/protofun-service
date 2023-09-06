import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.integer('userId').unsigned().references('id').inTable('users').notNullable().onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.dropForeign(['userId'])
    table.dropColumn('userId')
  })
}
