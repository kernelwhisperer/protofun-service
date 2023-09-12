// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers"
import type { KnexAdapterOptions, KnexAdapterParams } from "@feathersjs/knex"
import { KnexService } from "@feathersjs/knex"

import type { Application } from "../../declarations"
import type { Alert, AlertData, AlertPatch, AlertQuery } from "./alerts.schema"

export type { Alert, AlertData, AlertPatch, AlertQuery }

export interface AlertParams extends KnexAdapterParams<AlertQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class AlertService<ServiceParams extends Params = AlertParams> extends KnexService<
  Alert,
  AlertData,
  AlertParams,
  AlertPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    Model: app.get("postgresqlClient"),
    name: "alerts",
    paginate: app.get("paginate"),
  }
}
