import { TwitterApi } from "twitter-api-v2"

const client = new TwitterApi({
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  appKey: process.env.TWITTER_CONSUMER_KEY as string,
  appSecret: process.env.TWITTER_CONSUMER_SECRET as string,
})

export async function sendTweet(message: string) {
  return client.v2.tweet(escapeMarkdown(message))
}

export async function sendTweetWithPhotos(filePaths: string[], message: string) {
  const mediaIds = await Promise.all(filePaths.map((filePath) => client.v1.uploadMedia(filePath)))
  return await client.v2.tweet(escapeMarkdown(message), { media: { media_ids: mediaIds } })
}

function escapeMarkdown(message: string) {
  return message.replace(/\*/g, "")
}
