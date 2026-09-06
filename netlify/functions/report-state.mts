import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('tic-monthly-reports', { consistency: 'strong' })
  const { blobs } = await store.list({ prefix: 'snapshots/' })
  const snapshots = (await Promise.all(blobs.map(async ({ key }) => {
    return store.get(key, { type: 'json' })
  }))).filter(Boolean)

  snapshots.sort((a: any, b: any) => String(b?.report?.slug ?? '').localeCompare(String(a?.report?.slug ?? '')))

  return Response.json({ snapshots }, {
    headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' },
  })
}

export const config: Config = {
  path: '/api/report-state',
}
