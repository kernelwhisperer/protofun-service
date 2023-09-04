// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const alertsSchema = {
  $id: 'Alerts',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'protocolId', 'metricId', 'triggerValue'],
  properties: {
    id: { type: 'number' },
    protocolId: { type: 'string' },
    metricId: { type: 'string' },
    triggerValue: { type: 'string' }
  }
} as const
export type Alerts = FromSchema<typeof alertsSchema>
export const alertsValidator = getValidator(alertsSchema, dataValidator)
export const alertsResolver = resolve<Alerts, HookContext>({})

export const alertsExternalResolver = resolve<Alerts, HookContext>({})

// Schema for creating new data
export const alertsDataSchema = {
  $id: 'AlertsData',
  type: 'object',
  additionalProperties: false,
  required: ['protocolId', 'metricId', 'triggerValue'],
  properties: {
    ...alertsSchema.properties
  }
} as const
export type AlertsData = FromSchema<typeof alertsDataSchema>
export const alertsDataValidator = getValidator(alertsDataSchema, dataValidator)
export const alertsDataResolver = resolve<AlertsData, HookContext>({})

// Schema for updating existing data
export const alertsPatchSchema = {
  $id: 'AlertsPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...alertsSchema.properties
  }
} as const
export type AlertsPatch = FromSchema<typeof alertsPatchSchema>
export const alertsPatchValidator = getValidator(alertsPatchSchema, dataValidator)
export const alertsPatchResolver = resolve<AlertsPatch, HookContext>({})

// Schema for allowed query properties
export const alertsQuerySchema = {
  $id: 'AlertsQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(alertsSchema.properties)
  }
} as const
export type AlertsQuery = FromSchema<typeof alertsQuerySchema>
export const alertsQueryValidator = getValidator(alertsQuerySchema, queryValidator)
export const alertsQueryResolver = resolve<AlertsQuery, HookContext>({})
