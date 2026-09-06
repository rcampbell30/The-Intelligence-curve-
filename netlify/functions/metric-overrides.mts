import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

type MetricOverride = {
  headline?: string
  secondary?: string
  asOf?: string
  approvedAt?: string
  sourceId?: string
}

export default async () => {
  const store = getStore('tic-source-monitoring')
  const { blobs } = await store.list({ prefix: 'overrides/' })
  const overrides: Record<string, MetricOverride> = {}

  await Promise.all(blobs.map(async ({ key }) => {
    const value = await store.get(key, { type: 'json' }) as MetricOverride | null
    if (!value) return
    const metricId = key.replace(/^overrides\//, '')
    overrides[metricId] = value
  }))

  return Response.json({ overrides }, {
    headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' },
  })
}

export const config: Config = {
  path: '/api/metric-overrides',
}
