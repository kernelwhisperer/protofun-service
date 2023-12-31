import "./load-dotenv"
import "./cron"

// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import configuration from "@feathersjs/configuration"
import { feathers } from "@feathersjs/feathers"
import {
  bodyParser,
  cors,
  errorHandler,
  koa,
  parseAuthentication,
  rest,
  serveStatic,
} from "@feathersjs/koa"
import socketio from "@feathersjs/socketio"

import { authentication } from "./authentication"
import { channels } from "./channels"
import { configurationValidator } from "./configuration"
import type { Application } from "./declarations"
import { logError } from "./hooks/log-error"
import { postgresql } from "./postgresql"
import { services } from "./services/index"

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware
// app.use(cors({ origin: "*" }))
app.use(cors())
app.use(serveStatic(app.get("public")))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: "*",
    },
  })
)
app.configure(postgresql)
app.configure(authentication)
app.configure(services)
app.configure(channels)

// Register hooks that run on all service methods
app.hooks({
  after: {},
  around: {
    all: [logError],
  },
  before: {},
  error: {},
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: [],
})

export { app }
