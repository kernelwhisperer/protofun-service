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
    webPush: {
      properties: {
        privateKey: { type: "string" },
        publicKey: { type: "string" },
      },
      type: "object",
    },
  },
  required: ["host", "port", "public", "webPush"],
  type: "object",
} as const

declare module "./declarations" {
  interface Configuration {
    webPush: {
      privateKey: string
      publicKey: string
    }
  }
}

export const configurationValidator = getValidator(configurationSchema, dataValidator)

export type ApplicationConfiguration = FromSchema<typeof configurationSchema>
