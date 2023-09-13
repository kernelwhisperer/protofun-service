// For more information about this file see https://dove.feathersjs.com/guides/cli/channels.html
import "@feathersjs/transport-commons"

import type { AuthenticationResult } from "@feathersjs/authentication"
import type { Params, RealTimeConnection } from "@feathersjs/feathers"

import type { Application, HookContext } from "./declarations"

interface DataWithUserId {
  userId?: number
}

function isDataWithUserId(data: unknown): data is DataWithUserId {
  return typeof data === "object" && data !== null && "userId" in data
}

export const channels = (app: Application) => {
  app.on("connection", (connection: RealTimeConnection) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel("anonymous").join(connection)
  })

  app.on("login", (authResult: AuthenticationResult, { connection }: Params) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // The connection is no longer anonymous, remove it
      app.channel("anonymous").leave(connection)

      // Add it to the authenticated user channel
      app.channel(`user-${authResult.user.id}`).join(connection)
    }
  })

  app.publish((data: unknown, _context: HookContext) => {
    if (isDataWithUserId(data) && data.userId) {
      return app.channel(`user-${data.userId}`)
    }

    throw new Error(`Cannot find user channel: ${JSON.stringify(data)}`)
  })
}
