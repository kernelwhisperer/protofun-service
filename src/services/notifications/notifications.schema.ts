// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { FromSchema } from "@feathersjs/schema"
import { getValidator, querySyntax, resolve } from "@feathersjs/schema"

import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"

// Main data model schema
export const notificationSchema = {
  $id: "Notification",
  additionalProperties: false,
  properties: {
    alertId: { type: "integer" },
    archived: { type: "boolean" },
    createdAt: { type: "number" },
    id: { type: "number" },
    text: { type: "string" },
    updatedAt: { type: "number" },
    userId: { type: "integer" },
  },
  required: ["id", "text", "createdAt", "userId", "alertId"],
  type: "object",
} as const
export type Notification = FromSchema<typeof notificationSchema>
export const notificationValidator = getValidator(notificationSchema, dataValidator)
export const notificationResolver = resolve<Notification, HookContext>({})

export const notificationExternalResolver = resolve<Notification, HookContext>({})

// Schema for creating new data
export const notificationDataSchema = {
  $id: "NotificationData",
  additionalProperties: false,
  properties: {
    ...notificationSchema.properties,
  },
  required: ["text", "alertId", "userId"],
  type: "object",
} as const
export type NotificationData = FromSchema<typeof notificationDataSchema>
export const notificationDataValidator = getValidator(notificationDataSchema, dataValidator)
export const notificationDataResolver = resolve<NotificationData, HookContext>({
  archived: async () => false,
  createdAt: async () => {
    return Math.floor(Date.now() / 1000)
  },
})

// Schema for updating existing data
export const notificationPatchSchema = {
  $id: "NotificationPatch",
  additionalProperties: false,
  properties: {
    ...notificationSchema.properties,
  },
  required: [],
  type: "object",
} as const
export type NotificationPatch = FromSchema<typeof notificationPatchSchema>
export const notificationPatchValidator = getValidator(notificationPatchSchema, dataValidator)
export const notificationPatchResolver = resolve<NotificationPatch, HookContext>({
  updatedAt: async () => {
    return Math.floor(Date.now() / 1000)
  },
})

// Schema for allowed query properties
export const notificationQuerySchema = {
  $id: "NotificationQuery",
  additionalProperties: false,
  properties: {
    ...querySyntax(notificationSchema.properties),
  },
  type: "object",
} as const
export type NotificationQuery = FromSchema<typeof notificationQuerySchema>
export const notificationQueryValidator = getValidator(notificationQuerySchema, queryValidator)
export const notificationQueryResolver = resolve<NotificationQuery, HookContext>({})
