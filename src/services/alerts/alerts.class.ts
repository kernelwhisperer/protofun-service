// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Alerts, AlertsData, AlertsPatch, AlertsQuery } from './alerts.schema'

export type { Alerts, AlertsData, AlertsPatch, AlertsQuery }

export interface AlertsParams extends KnexAdapterParams<AlertsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class AlertsService<ServiceParams extends Params = AlertsParams> extends KnexService<
  Alerts,
  AlertsData,
  AlertsParams,
  AlertsPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'alerts'
  }
}
