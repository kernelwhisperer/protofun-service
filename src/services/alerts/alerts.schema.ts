// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { FromSchema } from "@feathersjs/schema"
import { getValidator, querySyntax, resolve } from "@feathersjs/schema"
import { MetricId, ProtocolId } from "protofun"

import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"

// Main data model schema
export const alertSchema = {
  $id: "Alert",
  additionalProperties: false,
  properties: {
    createdAt: { type: "number" },
    id: { type: "number" },
    increase: { type: "boolean" },
    metricId: { type: "string" },
    paused: { type: "boolean" },
    protocolId: { type: "string" },
    startTimestamp: { type: "string" },
    startValue: { type: "string" },
    triggerValue: { type: "string" },
    updatedAt: { type: "number" },
    userId: { type: "integer" },
  },
  required: [
    "id",
    "protocolId",
    "metricId",
    "triggerValue",
    "userId",
    "createdAt",
    "startValue",
    "startTimestamp",
    "increase",
    "paused",
    // priceUnitIndex TODO
  ],
  type: "object",
} as const
export type AlertRaw = FromSchema<typeof alertSchema>
export type Alert = AlertRaw & {
  metricId: MetricId
  protocolId: ProtocolId
}
export const alertValidator = getValidator(alertSchema, dataValidator)
export const alertResolver = resolve<Alert, HookContext>({})

export const alertExternalResolver = resolve<Alert, HookContext>({})

// Schema for creating new data
export const alertDataSchema = {
  $id: "AlertData",
  additionalProperties: false,
  properties: {
    ...alertSchema.properties,
  },
  required: ["protocolId", "metricId", "triggerValue", "startValue", "startTimestamp"],
  type: "object",
} as const
export type AlertData = FromSchema<typeof alertDataSchema>
export const alertDataValidator = getValidator(alertDataSchema, dataValidator)
export const alertDataResolver = resolve<AlertData, HookContext>({
  createdAt: async () => {
    return Math.floor(Date.now() / 1000)
  },
  increase: async (_value, alert) => {
    return parseInt(alert.startValue) < parseInt(alert.triggerValue)
  },
  paused: async () => false,
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user.id
  },
})

// Schema for updating existing data
export const alertPatchSchema = {
  $id: "AlertPatch",
  additionalProperties: false,
  properties: {
    ...alertSchema.properties,
  },
  required: [],
  type: "object",
} as const
export type AlertPatch = FromSchema<typeof alertPatchSchema>
export const alertPatchValidator = getValidator(alertPatchSchema, dataValidator)
export const alertPatchResolver = resolve<AlertPatch, HookContext>({
  updatedAt: async () => {
    return Math.floor(Date.now() / 1000)
  },
})

// Schema for allowed query properties
export const alertQuerySchema = {
  $id: "AlertQuery",
  additionalProperties: false,
  properties: {
    ...querySyntax(alertSchema.properties),
  },
  type: "object",
} as const
export type AlertQuery = FromSchema<typeof alertQuerySchema>
export const alertQueryValidator = getValidator(alertQuerySchema, queryValidator)
export const alertQueryResolver = resolve<AlertQuery, HookContext>({})
