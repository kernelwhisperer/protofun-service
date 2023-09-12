import type { FromSchema } from "@feathersjs/schema"
import { defaultAppSettings, getValidator } from "@feathersjs/schema"

import { dataValidator } from "./validators"

export const configurationSchema = {
  $id: "configuration",
  additionalProperties: false,
  properties: {
    ...defaultAppSettings,
    host: { type: "string" },
    port: { type: "number" },
    public: { type: "string" },
  },
  required: ["host", "port", "public"],
  type: "object",
} as const

export const configurationValidator = getValidator(configurationSchema, dataValidator)

export type ApplicationConfiguration = FromSchema<typeof configurationSchema>
