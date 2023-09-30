/* eslint-disable no-console */
import "../load-dotenv"

import { sendTweet } from "../utils/twitter"

sendTweet("Hello, this is a test.").then(console.log).catch(console.log)
