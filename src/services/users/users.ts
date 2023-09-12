// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication"
import { hooks as schemaHooks } from "@feathersjs/schema"

import type { Application } from "../../declarations"
import { getOptions, UserService } from "./users.class"
import {
  userDataResolver,
  userDataValidator,
  userExternalResolver,
  userPatchResolver,
  userPatchValidator,
  userQueryResolver,
  userQueryValidator,
  userResolver,
} from "./users.schema"
import { userMethods, userPath } from "./users.shared"

export * from "./users.class"
export * from "./users.schema"

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // You can add additional custom events to be sent to clients here
    events: [],

    // A list of all methods this service exposes externally
    methods: userMethods,
  })
  // Initialize hooks
  app.service(userPath).hooks({
    after: {
      all: [],
    },
    around: {
      all: [
        schemaHooks.resolveExternal(userExternalResolver),
        schemaHooks.resolveResult(userResolver),
      ],
      create: [],
      find: [authenticate("jwt")],
      get: [authenticate("jwt")],
      patch: [authenticate("jwt")],
      remove: [authenticate("jwt")],
      update: [authenticate("jwt")],
    },
    before: {
      all: [
        schemaHooks.validateQuery(userQueryValidator),
        schemaHooks.resolveQuery(userQueryResolver),
      ],
      create: [
        schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver),
      ],
      find: [],
      get: [],
      patch: [
        schemaHooks.validateData(userPatchValidator),
        schemaHooks.resolveData(userPatchResolver),
      ],
      remove: [],
    },
    error: {
      all: [],
    },
  })
}

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [userPath]: UserService
  }
}
