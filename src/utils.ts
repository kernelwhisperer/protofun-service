import { MetricId, ProtocolId, QueryFn, Timeframe } from 'protofun'

export const allTimeframes: Timeframe[] = ['Block', 'Minute', 'Hour', 'Day', 'Week']

export async function loadQueryFn(
  protocolId: ProtocolId,
  metricId: MetricId
): Promise<{ query: QueryFn; supportedTimeframes: Timeframe[] }> {
  const { default: query, supportedTimeframes = allTimeframes } = await import(
    `protofun/dist/metrics/${protocolId}/${metricId}`
  )

  return { query, supportedTimeframes }
}

export function getLowestTimeframe(supportedTimeframes: Timeframe[]) {
  return supportedTimeframes.find((x) => x !== 'Block') as Timeframe
}
