// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  Notification,
  NotificationData,
  NotificationPatch,
  NotificationQuery
} from './notifications.schema'

export type { Notification, NotificationData, NotificationPatch, NotificationQuery }

export interface NotificationParams extends KnexAdapterParams<NotificationQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class NotificationService<ServiceParams extends Params = NotificationParams> extends KnexService<
  Notification,
  NotificationData,
  NotificationParams,
  NotificationPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'notifications'
  }
}
