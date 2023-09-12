// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import type { Application } from '../../declarations'
import { AlertService, getOptions } from './alerts.class'
import {
  alertDataResolver,
  alertDataValidator,
  alertExternalResolver,
  alertPatchResolver,
  alertPatchValidator,
  alertQueryResolver,
  alertQueryValidator,
  alertResolver
} from './alerts.schema'
import { alertMethods, alertPath } from './alerts.shared'

export * from './alerts.class'
export * from './alerts.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const alert = (app: Application) => {
  // Register our service on the Feathers application
  app.use(alertPath, new AlertService(getOptions(app)), {
    // You can add additional custom events to be sent to clients here
    events: [],

    // A list of all methods this service exposes externally
    methods: alertMethods
  })
  // Initialize hooks
  app.service(alertPath).hooks({
    after: {
      all: []
    },
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(alertExternalResolver),
        schemaHooks.resolveResult(alertResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(alertQueryValidator),
        schemaHooks.resolveQuery(alertQueryResolver)
      ],
      create: [
        schemaHooks.validateData(alertDataValidator),
        schemaHooks.resolveData(alertDataResolver)
      ],
      find: [],
      get: [],
      patch: [
        schemaHooks.validateData(alertPatchValidator),
        schemaHooks.resolveData(alertPatchResolver)
      ],
      remove: []
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
