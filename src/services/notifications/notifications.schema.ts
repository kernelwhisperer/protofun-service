// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { FromSchema } from "@feathersjs/schema"
import { getValidator, querySyntax, resolve, virtual } from "@feathersjs/schema"

import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"
import { AlertRaw, alertSchema } from "../alerts/alerts.schema"

// Main data model schema
export const notificationSchema = {
  $id: "Notification",
  additionalProperties: false,
  properties: {
    // NOTE: notificationQuerySchema must be updated as well.
    alert: { $ref: "Alert" },
    alertId: { type: "integer" },
    archived: { type: "boolean" },
    createdAt: { type: "number" },
    id: { type: "number" },
    text: { type: "string" },
    title: { type: "string" },
    updatedAt: { type: "number" },
    userId: { type: "integer" },
  },
  required: ["id", "text", "createdAt", "userId", "title"],
  type: "object",
} as const
export type Notification = FromSchema<
  typeof notificationSchema,
  {
    // All schema references need to be passed to get the correct type
    references: [typeof alertSchema]
  }
>
export const notificationValidator = getValidator(notificationSchema, dataValidator)
export const notificationResolver = resolve<Notification, HookContext>({
  alert: virtual(async (message, context) => {
    // Populate the user associated via `userId`
    if (!message.alertId) return
    return context.app.service("alerts").get(message.alertId) as Promise<AlertRaw>
  }),
})

export const notificationExternalResolver = resolve<Notification, HookContext>({})

// Schema for creating new data
export const notificationDataSchema = {
  $id: "NotificationData",
  additionalProperties: false,
  properties: {
    ...notificationSchema.properties,
  },
  required: ["text", "title", "userId"],
  type: "object",
} as const
export type NotificationData = FromSchema<
  typeof notificationDataSchema,
  {
    // All schema references need to be passed to get the correct type
    references: [typeof alertSchema]
  }
>
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
export type NotificationPatch = FromSchema<
  typeof notificationPatchSchema,
  {
    // All schema references need to be passed to get the correct type
    references: [typeof alertSchema]
  }
>
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
    ...querySyntax({
      alertId: { type: "integer" },
      archived: { type: "boolean" },
      createdAt: { type: "number" },
      id: { type: "number" },
      text: { type: "string" },
      title: { type: "string" },
      updatedAt: { type: "number" },
      userId: { type: "integer" },
    }),
  },
  type: "object",
} as const
export type NotificationQuery = FromSchema<
  typeof notificationQuerySchema,
  {
    // All schema references need to be passed to get the correct type
    references: [typeof alertSchema]
  }
>
export const notificationQueryValidator = getValidator(notificationQuerySchema, queryValidator)
export const notificationQueryResolver = resolve<NotificationQuery, HookContext>({})
