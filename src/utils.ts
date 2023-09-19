import { MetricFnsResult, MetricId, ProtocolId } from "protofun"

export async function loadMetricFns(
  protocolId: ProtocolId,
  metricId: MetricId
): Promise<MetricFnsResult> {
  const { default: query, subscribe } = await import(
    `protofun/dist/metrics/${protocolId}/${metricId}`
  )
  return { query, subscribe }
}
