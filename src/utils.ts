import chalk from "chalk"
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

export const isProduction = process.env.NODE_ENV === "production"

export function redColor(text: string) {
  return isProduction ? text : chalk.red(text)
}

export function blueColor(text: string) {
  return isProduction ? text : chalk.blue(text)
}

export function yellowColor(text: string) {
  return isProduction ? text : chalk.yellow(text)
}
