// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { passwordHash } from "@feathersjs/authentication-local"
import type { FromSchema } from "@feathersjs/schema"
import { getValidator, querySyntax, resolve } from "@feathersjs/schema"

import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"

// Main data model schema
export const userSchema = {
  $id: "User",
  additionalProperties: false,
  properties: {
    createdAt: { type: "number" },
    email: { type: "string" },
    googleId: { type: "string" },
    id: { type: "number" },
    password: { type: "string" },
    pushDevices: {
      items: {
        properties: {
          label: { type: "string" },
          sub: {
            properties: {
              endpoint: { type: "string" },
              expirationTime: { anyOf: [{ type: "number" }, { type: "null" }] },
              keys: {
                properties: {
                  auth: { type: "string" },
                  p256dh: { type: "string" },
                },
                required: ["auth", "p256dh"],
                type: "object",
              },
            },
            required: ["endpoint", "keys"],
            type: "object",
          },
        },
        required: ["label", "sub"],
        type: "object",
      },
      type: "array",
    },
    twitterId: { type: "string" },
    updatedAt: { type: "number" },
  },
  required: ["id", "email"],
  type: "object",
} as const
export type User = FromSchema<typeof userSchema>
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve<User, HookContext>({})

export const userExternalResolver = resolve<User, HookContext>({
  // The password should never be visible externally
  password: async () => undefined,
})

// Schema for creating new data
export const userDataSchema = {
  $id: "UserData",
  additionalProperties: false,
  properties: {
    ...userSchema.properties,
  },
  required: ["email"],
  type: "object",
} as const
export type UserData = FromSchema<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<UserData, HookContext>({
  createdAt: async () => {
    return Math.floor(Date.now() / 1000)
  },
  password: passwordHash({ strategy: "local" }),
})

// Schema for updating existing data
export const userPatchSchema = {
  $id: "UserPatch",
  additionalProperties: false,
  properties: {
    ...userSchema.properties,
  },
  required: [],
  type: "object",
} as const
export type UserPatch = FromSchema<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve<UserPatch, HookContext>({
  password: passwordHash({ strategy: "local" }),
  pushDevices: async (_value, user) => {
    return JSON.stringify(user.pushDevices) as any
  },
  updatedAt: async () => {
    return Math.floor(Date.now() / 1000)
  },
})

// Schema for allowed query properties
export const userQuerySchema = {
  $id: "UserQuery",
  additionalProperties: false,
  properties: {
    ...querySyntax(userSchema.properties),
  },
  type: "object",
} as const
export type UserQuery = FromSchema<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext>({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  id: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user.id
    }

    return value
  },
})
