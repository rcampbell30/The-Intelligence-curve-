import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

type PublicUpdateEvent = {
  id: string
  date: string
  category: 'Benchmarks' | 'Agents' | 'Scaling' | 'Economics' | 'Methodology'
  title: string
  summary: string
  source: string
  sourceUrl: string
  metricId?: string
  changeLabel?: string
  note?: string
}

export default async () => {
  const store = getStore('tic-source-monitoring')
  const { blobs } = await store.list({ prefix: 'public-updates/' })
  const events = (await Promise.all(blobs.map(async ({ key }) => {
    return await store.get(key, { type: 'json' }) as PublicUpdateEvent | null
  })))
    .filter((event): event is PublicUpdateEvent => Boolean(event))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))

  return Response.json({ events }, {
    headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' },
  })
}

export const config: Config = {
  path: '/api/runtime-updates',
}
