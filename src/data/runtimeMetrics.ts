import { metricDetails } from './metricDetails'
import { metrics, type Metric } from './metrics'

type MetricOverride = Partial<Pick<Metric, 'headline' | 'secondary' | 'summary' | 'asOf'>> & {
  approvedAt?: string
  sourceId?: string
  detailInterpretation?: string
  seriesValue?: number
  seriesDetail?: string
}

type OverridePayload = {
  overrides?: Record<string, MetricOverride>
}

function monthLabel(value: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

export function applyMetricOverrides(payload: OverridePayload) {
  if (!payload?.overrides) return

  for (const [metricId, override] of Object.entries(payload.overrides)) {
    const metric = metrics.find((item) => item.id === metricId)
    if (!metric) continue
    if (typeof override.headline === 'string') metric.headline = override.headline
    if (typeof override.secondary === 'string') metric.secondary = override.secondary
    if (typeof override.summary === 'string') metric.summary = override.summary
    if (typeof override.asOf === 'string') metric.asOf = override.asOf

    const detail = metricDetails[metricId]
    if (!detail) continue
    if (typeof override.detailInterpretation === 'string') detail.interpretation = override.detailInterpretation

    if (metricId === 'hle-frontier' && typeof override.seriesValue === 'number' && override.asOf) {
      const label = monthLabel(override.asOf)
      const point = { label, value: override.seriesValue, detail: override.seriesDetail ?? 'Current leader' }
      const existingIndex = detail.series?.findIndex((item) => item.label === label) ?? -1
      if (existingIndex >= 0 && detail.series) detail.series[existingIndex] = point
      else detail.series = [...(detail.series ?? []), point]
    }
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
