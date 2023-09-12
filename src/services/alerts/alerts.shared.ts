// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'

import type { ClientApplication } from '../../client'
import type { Alert, AlertData, AlertPatch, AlertQuery, AlertService } from './alerts.class'

export type { Alert, AlertData, AlertPatch, AlertQuery }

export const alertMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export type AlertClientService = Pick<
  AlertService<Params<AlertQuery>>,
  (typeof alertMethods)[number]
>

export const alertPath = 'alerts'

export const alertClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(alertPath, connection.service(alertPath), {
    methods: alertMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [alertPath]: AlertClientService
  }
}
