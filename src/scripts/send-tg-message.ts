/* eslint-disable no-console */
import "../load-dotenv"

import { sendTelegramMessage } from "../utils/telegram"

sendTelegramMessage("Hello, World!").then(console.log).catch(console.error)
