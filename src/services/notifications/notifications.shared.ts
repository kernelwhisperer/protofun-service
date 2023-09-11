// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Notification,
  NotificationData,
  NotificationPatch,
  NotificationQuery,
  NotificationService
} from './notifications.class'

export type { Notification, NotificationData, NotificationPatch, NotificationQuery }

export type NotificationClientService = Pick<
  NotificationService<Params<NotificationQuery>>,
  (typeof notificationMethods)[number]
>

export const notificationPath = 'notifications'

export const notificationMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const notificationClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(notificationPath, connection.service(notificationPath), {
    methods: notificationMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [notificationPath]: NotificationClientService
  }
}
