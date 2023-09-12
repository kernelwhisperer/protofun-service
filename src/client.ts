// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import type { AuthenticationClientOptions } from "@feathersjs/authentication-client"
import authenticationClient from "@feathersjs/authentication-client"
import type { Application, TransportConnection } from "@feathersjs/feathers"
import { feathers } from "@feathersjs/feathers"

import { alertClient } from "./services/alerts/alerts.shared"
import { notificationClient } from "./services/notifications/notifications.shared"
import { userClient } from "./services/users/users.shared"
export type { Alert, AlertData, AlertPatch, AlertQuery } from "./services/alerts/alerts.shared"
export type {
  Notification,
  NotificationData,
  NotificationPatch,
  NotificationQuery,
} from "./services/notifications/notifications.shared"
export type { User, UserData, UserPatch, UserQuery } from "./services/users/users.shared"

export interface ServiceTypes {}

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the protofun-service app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set("connection", connection)

  client.configure(alertClient)
  client.configure(userClient)
  client.configure(notificationClient)
  return client
}
