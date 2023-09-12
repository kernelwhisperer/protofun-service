// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'
import { alert } from './alerts/alerts'
import { notification } from './notifications/notifications'
import { user } from './users/users'

export const services = (app: Application) => {
  app.configure(user)
  app.configure(alert)
  app.configure(notification)
  // All services will be registered here
}
