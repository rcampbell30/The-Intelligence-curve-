import { metrics, type Metric } from './metrics'

type MetricOverride = Partial<Pick<Metric, 'headline' | 'secondary' | 'asOf'>> & {
  approvedAt?: string
  sourceId?: string
}

type OverridePayload = {
  overrides?: Record<string, MetricOverride>
}

export function applyMetricOverrides(payload: OverridePayload) {
  if (!payload?.overrides) return

  for (const [metricId, override] of Object.entries(payload.overrides)) {
    const metric = metrics.find((item) => item.id === metricId)
    if (!metric) continue
    if (typeof override.headline === 'string') metric.headline = override.headline
    if (typeof override.secondary === 'string') metric.secondary = override.secondary
    if (typeof override.asOf === 'string') metric.asOf = override.asOf
  }
}

export async function loadMetricOverrides() {
  try {
    const response = await fetch('/api/metric-overrides')
    if (!response.ok) return
    applyMetricOverrides(await response.json() as OverridePayload)
  } catch {
    // Static source-backed metrics remain the safe fallback if the runtime layer is unavailable.
  }
}
