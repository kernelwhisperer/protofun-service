// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  alertDataValidator,
  alertPatchValidator,
  alertQueryValidator,
  alertResolver,
  alertExternalResolver,
  alertDataResolver,
  alertPatchResolver,
  alertQueryResolver
} from './alerts.schema'

import type { Application } from '../../declarations'
import { AlertService, getOptions } from './alerts.class'
import { alertPath, alertMethods } from './alerts.shared'

export * from './alerts.class'
export * from './alerts.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const alert = (app: Application) => {
  // Register our service on the Feathers application
  app.use(alertPath, new AlertService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: alertMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(alertPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(alertExternalResolver),
        schemaHooks.resolveResult(alertResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(alertQueryValidator), schemaHooks.resolveQuery(alertQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(alertDataValidator), schemaHooks.resolveData(alertDataResolver)],
      patch: [schemaHooks.validateData(alertPatchValidator), schemaHooks.resolveData(alertPatchResolver)],
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
    [alertPath]: AlertService
  }
}
