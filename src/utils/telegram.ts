import fs from "fs"
import { Telegraf } from "telegraf"

const bot = new Telegraf(process.env.TELEGRAM_BOT_KEY as string)
export const channelId = process.env.TELEGRAM_CHANNEL_ID as string

export async function sendTelegramMessage(message: string) {
  return await bot.telegram.sendMessage(channelId, message)
}

export async function sendTelegramPhoto(filePath: string, caption: string) {
  return await bot.telegram.sendPhoto(
    channelId,
    { filename: filePath, source: fs.createReadStream(filePath) },
    {
      caption,
      parse_mode: "MarkdownV2",
    }
  )
}

export async function sendTelegramMediaGroup(items: Array<{ caption: string; filePath: string }>) {
  return await bot.telegram.sendMediaGroup(
    channelId,
    items.map(({ caption, filePath }) => ({
      caption,
      media: { source: fs.createReadStream(filePath) },
      parse_mode: "MarkdownV2",
      type: "photo",
    }))
  )
}
