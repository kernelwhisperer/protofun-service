// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax, virtual } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { MetricId, ProtocolId } from 'protofun'

// Main data model schema
export const alertSchema = {
  $id: 'Alert',
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'protocolId',
    'metricId',
    'triggerValue',
    'userId',
    'createdAt',
    'startValue',
    'startTimestamp',
    'increase',
    'paused'
    // priceUnitIndex TODO
  ],
  properties: {
    id: { type: 'number' },
    protocolId: { type: 'string' },
    metricId: { type: 'string' },
    triggerValue: { type: 'string' },
    userId: { type: 'integer' },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
    startValue: { type: 'string' },
    startTimestamp: { type: 'string' },
    increase: { type: 'boolean' },
    paused: { type: 'boolean' }
  }
} as const
export type Alert = FromSchema<typeof alertSchema> & {
  protocolId: ProtocolId
  metricId: MetricId
}
export const alertValidator = getValidator(alertSchema, dataValidator)
export const alertResolver = resolve<Alert, HookContext>({})

export const alertExternalResolver = resolve<Alert, HookContext>({})

// Schema for creating new data
export const alertDataSchema = {
  $id: 'AlertData',
  type: 'object',
  additionalProperties: false,
  required: ['protocolId', 'metricId', 'triggerValue', 'startValue', 'startTimestamp'],
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
  createdAt: async () => {
    return Math.floor(Date.now() / 1000)
  },
  paused: async () => false,
  increase: async (_value, alert) => {
    return parseInt(alert.startValue) < parseInt(alert.triggerValue)
  }
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
export const alertPatchResolver = resolve<AlertPatch, HookContext>({
  updatedAt: async () => {
    return Math.floor(Date.now() / 1000)
  }
})

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
