import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

function authorised(req: Request) {
  const expected = Netlify.env.get('TIC_REVIEW_KEY')
  const provided = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return Boolean(expected && provided && expected === provided)
}

export default async (req: Request) => {
  if (!authorised(req)) return new Response('Unauthorized', { status: 401 })

  const store = getStore('tic-source-monitoring', { consistency: 'strong' })
  const { blobs } = await store.list({ prefix: 'drafts/' })
  const drafts = (await Promise.all(blobs.map(async ({ key }) => {
    const draft = await store.get(key, { type: 'json' })
    return draft ? { key, ...draft } : null
  }))).filter(Boolean)
    .sort((a: any, b: any) => String(b.detectedAt).localeCompare(String(a.detectedAt)))

  return Response.json({ drafts }, {
    headers: { 'cache-control': 'no-store' },
  })
}

export const config: Config = {
  path: '/api/review-queue',
}
