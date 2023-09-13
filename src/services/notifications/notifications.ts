// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication"
import { hooks as schemaHooks } from "@feathersjs/schema"
import { setField } from "feathers-hooks-common"

import type { Application } from "../../declarations"
import { logger } from "../../logger"
import { getOptions, NotificationService } from "./notifications.class"
import {
  notificationDataResolver,
  notificationDataValidator,
  notificationExternalResolver,
  notificationPatchResolver,
  notificationPatchValidator,
  notificationQueryResolver,
  notificationQueryValidator,
  notificationResolver,
} from "./notifications.schema"
import { notificationMethods, notificationPath } from "./notifications.shared"
import { watcher } from "./watcher/watcher"

export * from "./notifications.class"
export * from "./notifications.schema"

// A configure function that registers the service and its hooks via `app.configure`
export const notification = (app: Application) => {
  // Register our service on the Feathers application
  app.use(notificationPath, new NotificationService(getOptions(app)), {
    // You can add additional custom events to be sent to clients here
    events: [],

    // A list of all methods this service exposes externally
    methods: notificationMethods,
  })
  // Initialize hooks
  app.service(notificationPath).hooks({
    after: {
      all: [],
    },
    around: {
      all: [
        authenticate("jwt"),
        schemaHooks.resolveExternal(notificationExternalResolver),
        schemaHooks.resolveResult(notificationResolver),
      ],
    },
    before: {
      all: [
        setField({
          as: "params.query.userId",
          from: "params.user.id",
        }),
        schemaHooks.validateQuery(notificationQueryValidator),
        schemaHooks.resolveQuery(notificationQueryResolver),
      ],
      create: [
        schemaHooks.validateData(notificationDataValidator),
        schemaHooks.resolveData(notificationDataResolver),
      ],
      find: [],
      get: [],
      patch: [
        schemaHooks.validateData(notificationPatchValidator),
        schemaHooks.resolveData(notificationPatchResolver),
      ],
      remove: [],
    },
    error: {
      all: [],
    },
  })
  // Setup watchers
  watcher(app).then(() => {
    logger.info("Notification watcher: ready")
  })
}

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [notificationPath]: NotificationService
  }
}
