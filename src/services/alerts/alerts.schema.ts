// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const alertSchema = {
  $id: 'Alert',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'protocolId', 'metricId', 'triggerValue', 'userId'], // priceUnitIndex TODO
  properties: {
    id: { type: 'number' },
    protocolId: { type: 'string' },
    metricId: { type: 'string' },
    triggerValue: { type: 'string' },
    userId: { type: 'integer' }
  }
} as const
export type Alert = FromSchema<typeof alertSchema>
export const alertValidator = getValidator(alertSchema, dataValidator)
export const alertResolver = resolve<Alert, HookContext>({})

export const alertExternalResolver = resolve<Alert, HookContext>({})

// Schema for creating new data
export const alertDataSchema = {
  $id: 'AlertData',
  type: 'object',
  additionalProperties: false,
  required: ['protocolId', 'metricId', 'triggerValue'],
  properties: {
    ...alertSchema.properties
  }
} as const
export type AlertData = FromSchema<typeof alertDataSchema>
export const alertDataValidator = getValidator(alertDataSchema, dataValidator)
export const alertDataResolver = resolve<AlertData, HookContext>({
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user.id
  },
})

// Schema for updating existing data
export const alertPatchSchema = {
  $id: 'AlertPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...alertSchema.properties
  }
} as const
export type AlertPatch = FromSchema<typeof alertPatchSchema>
export const alertPatchValidator = getValidator(alertPatchSchema, dataValidator)
export const alertPatchResolver = resolve<AlertPatch, HookContext>({})

// Schema for allowed query properties
export const alertQuerySchema = {
  $id: 'AlertQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(alertSchema.properties)
  }
} as const
export type AlertQuery = FromSchema<typeof alertQuerySchema>
export const alertQueryValidator = getValidator(alertQuerySchema, queryValidator)
export const alertQueryResolver = resolve<AlertQuery, HookContext>({})
