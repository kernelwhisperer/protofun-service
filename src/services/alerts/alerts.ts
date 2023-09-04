// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  alertsDataValidator,
  alertsPatchValidator,
  alertsQueryValidator,
  alertsResolver,
  alertsExternalResolver,
  alertsDataResolver,
  alertsPatchResolver,
  alertsQueryResolver
} from './alerts.schema'

import type { Application } from '../../declarations'
import { AlertsService, getOptions } from './alerts.class'
import { alertsPath, alertsMethods } from './alerts.shared'

export * from './alerts.class'
export * from './alerts.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const alerts = (app: Application) => {
  // Register our service on the Feathers application
  app.use(alertsPath, new AlertsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: alertsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(alertsPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(alertsExternalResolver), schemaHooks.resolveResult(alertsResolver)]
    },
    before: {
      all: [schemaHooks.validateQuery(alertsQueryValidator), schemaHooks.resolveQuery(alertsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(alertsDataValidator), schemaHooks.resolveData(alertsDataResolver)],
      patch: [schemaHooks.validateData(alertsPatchValidator), schemaHooks.resolveData(alertsPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [alertsPath]: AlertsService
  }
}
