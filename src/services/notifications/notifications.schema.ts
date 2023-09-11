// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const notificationSchema = {
  $id: 'Notification',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'text'],
  properties: {
    id: { type: 'number' },

    text: { type: 'string' }
  }
} as const
export type Notification = FromSchema<typeof notificationSchema>
export const notificationValidator = getValidator(notificationSchema, dataValidator)
export const notificationResolver = resolve<Notification, HookContext>({})

export const notificationExternalResolver = resolve<Notification, HookContext>({})

// Schema for creating new data
export const notificationDataSchema = {
  $id: 'NotificationData',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    ...notificationSchema.properties
  }
} as const
export type NotificationData = FromSchema<typeof notificationDataSchema>
export const notificationDataValidator = getValidator(notificationDataSchema, dataValidator)
export const notificationDataResolver = resolve<NotificationData, HookContext>({})

// Schema for updating existing data
export const notificationPatchSchema = {
  $id: 'NotificationPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...notificationSchema.properties
  }
} as const
export type NotificationPatch = FromSchema<typeof notificationPatchSchema>
export const notificationPatchValidator = getValidator(notificationPatchSchema, dataValidator)
export const notificationPatchResolver = resolve<NotificationPatch, HookContext>({})

// Schema for allowed query properties
export const notificationQuerySchema = {
  $id: 'NotificationQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(notificationSchema.properties)
  }
} as const
export type NotificationQuery = FromSchema<typeof notificationQuerySchema>
export const notificationQueryValidator = getValidator(notificationQuerySchema, queryValidator)
export const notificationQueryResolver = resolve<NotificationQuery, HookContext>({})
