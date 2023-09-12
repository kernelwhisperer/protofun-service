import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.string('protocolId')
    table.string('metricId')
    table.string('triggerValue')
    table.dropColumn('text')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('alerts', (table) => {
    table.dropColumn('protocolId')
    table.dropColumn('metricId')
    table.dropColumn('triggerValue')
    table.string('text')
  })
}
