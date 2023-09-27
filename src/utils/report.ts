import { MetricId, ProtocolId, Timeframe } from "protofun"

export function getLatestTimeUnit(
  timestamp: number,
  intervalInSeconds: number,
  offset: number
): number {
  const timestampSeconds = timestamp
  const latestTimeUnit =
    Math.floor((timestampSeconds - offset) / intervalInSeconds) * intervalInSeconds

  return latestTimeUnit + offset
}

export const CANDLE_INTERVAL_SECONDS: Record<Timeframe, number> = {
  Block: 0,
  Day: 86400,
  Hour: 3600,
  Minute: 60,
  Week: 604800,
}

export const CANDLE_INTERVAL_OFFSETS: Record<Timeframe, number> = {
  Block: 0,
  Day: 0,
  Hour: 0,
  Minute: 0,
  Week: 345600,
}

export function getLatestCandleTimestamp(timeframe: Timeframe) {
  return getLatestTimeUnit(
    Date.now() / 1000,
    CANDLE_INTERVAL_SECONDS[timeframe],
    CANDLE_INTERVAL_OFFSETS[timeframe]
  )
}

export type ReportRequest = {
  metricId: MetricId
  priceUnit: number
  protocolId: ProtocolId
  since: string
  timeframe: Timeframe
  until: string
  variant: number
}

/**
 *
 * @param timestampInSeconds in UTC no timezone
 * @returns
 */
export function getWeekNumber(timestampInSeconds: number) {
  const date = new Date(timestampInSeconds * 1000) // Convert to milliseconds
  const startOfYear = new Date(date.getFullYear(), 0, 1) // First day of the year
  const dayOfYear =
    (date.getTime() - startOfYear.getTime() + startOfYear.getTimezoneOffset() * 60000) / 86400000 +
    1 // Day of the year

  const weekNumber = Math.ceil(dayOfYear / 7) // Week number
  return weekNumber
}
