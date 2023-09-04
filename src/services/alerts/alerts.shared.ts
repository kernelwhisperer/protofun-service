// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Alerts, AlertsData, AlertsPatch, AlertsQuery, AlertsService } from './alerts.class'

export type { Alerts, AlertsData, AlertsPatch, AlertsQuery }

export type AlertsClientService = Pick<AlertsService<Params<AlertsQuery>>, (typeof alertsMethods)[number]>

export const alertsPath = 'alerts'

export const alertsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const alertsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(alertsPath, connection.service(alertsPath), {
    methods: alertsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [alertsPath]: AlertsClientService
  }
}
