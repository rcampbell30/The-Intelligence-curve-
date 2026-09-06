import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { metrics, type Metric } from '../../src/data/metrics'
import { buildReportDefinition, type FrozenReportSnapshot, type FrozenMetricSignal } from '../../src/data/reports'
import { mergeRuntimeUpdateEvents, updateEvents, type UpdateEvent } from '../../src/data/updates'

type MetricOverride = Partial<Pick<Metric, 'headline' | 'secondary' | 'summary' | 'asOf'>> & {
  approvedAt?: string
  sourceId?: string
}

function previousMonthSlug(date: Date) {
  const previous = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1))
  return previous.toISOString().slice(0, 7)
}

function lastDayOfMonth(slug: string) {
  const [year, month] = slug.split('-').map(Number)
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10)
}

async function loadOverrides() {
  const store = getStore('tic-source-monitoring', { consistency: 'strong' })
  const { blobs } = await store.list({ prefix: 'overrides/' })
  const overrides: Record<string, MetricOverride> = {}

  await Promise.all(blobs.map(async ({ key }) => {
    const value = await store.get(key, { type: 'json' }) as MetricOverride | null
    if (!value) return
    overrides[key.replace(/^overrides\//, '')] = value
  }))

  return overrides
}

async function loadRuntimeUpdates() {
  const store = getStore('tic-source-monitoring', { consistency: 'strong' })
  const { blobs } = await store.list({ prefix: 'public-updates/' })
  return (await Promise.all(blobs.map(async ({ key }) => {
    return await store.get(key, { type: 'json' }) as UpdateEvent | null
  }))).filter((event): event is UpdateEvent => Boolean(event))
}

function freezeSignal(metric: Metric, override?: MetricOverride): FrozenMetricSignal {
  return {
    ...metric,
    headline: override?.headline ?? metric.headline,
    secondary: override?.secondary ?? metric.secondary,
    summary: override?.summary ?? metric.summary,
    asOf: override?.asOf ?? metric.asOf,
  }
}

export default async () => {
  const deployContext = Netlify.env.get('CONTEXT')
  if (deployContext && deployContext !== 'production') return

  const now = new Date()
  const slug = previousMonthSlug(now)
  if (slug < '2026-09') return

  const archive = getStore('tic-monthly-reports', { consistency: 'strong' })
  const snapshotKey = `snapshots/${slug}`
  if (await archive.get(snapshotKey, { type: 'json' })) return

  const runtimeUpdates = await loadRuntimeUpdates()
  mergeRuntimeUpdateEvents(runtimeUpdates)

  const report = buildReportDefinition(slug)
  const overrides = await loadOverrides()
  const signals = report.signalMetricIds
    .map((metricId) => metrics.find((metric) => metric.id === metricId))
    .filter((metric): metric is Metric => Boolean(metric))
    .map((metric) => freezeSignal(metric, overrides[metric.id]))
  const events = updateEvents
    .filter((event) => event.date.startsWith(slug))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))

  const finalizedAt = now.toISOString()
  const finalReport = {
    ...report,
    status: 'final' as const,
    eventIds: events.map((event) => event.id),
    updatedAt: lastDayOfMonth(slug),
    methodology: `Final edition frozen automatically after month-end. The accepted headline metric values and update-event records below are stored as a write-once snapshot finalized ${finalizedAt}; later leaderboard or runtime changes do not rewrite this edition.`,
  }

  const snapshot: FrozenReportSnapshot = {
    version: 1,
    finalizedAt,
    report: finalReport,
    signals,
    events,
  }

  // Re-check immediately before the write so routine retries remain idempotent.
  if (await archive.get(snapshotKey, { type: 'json' })) return
  await archive.setJSON(snapshotKey, snapshot)
}

export const config: Config = {
  schedule: '5 0 * * *',
}
