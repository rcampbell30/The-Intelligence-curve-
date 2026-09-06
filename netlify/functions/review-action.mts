import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

type Snapshot = Record<string, string | number>

type Draft = {
  sourceId: string
  sourceLabel: string
  sourceUrl: string
  metricIds: string[]
  detectedAt: string
  publishedSnapshot: Snapshot
  candidateSnapshot: Snapshot
  status: 'pending-review' | 'approved' | 'rejected'
  reviewedAt?: string
  action?: 'approve' | 'reject'
}

function authorised(req: Request) {
  const expected = Netlify.env.get('TIC_REVIEW_KEY')
  const provided = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return Boolean(expected && provided && expected === provided)
}

function publicOverride(sourceId: string, snapshot: Snapshot, approvedAt: string) {
  const asOf = approvedAt.slice(0, 10)

  if (sourceId === 'hle-leaderboard') {
    const score = Number(snapshot.score)
    const leader = String(snapshot.leader)
    if (!Number.isFinite(score) || !leader) return null
    return {
      metricId: 'hle-frontier',
      value: {
        headline: `${score.toFixed(2)}%`,
        secondary: `current leaderboard leader · ${leader}`,
        asOf,
        approvedAt,
        sourceId,
      },
    }
  }

  if (sourceId === 'arc-agi-3-astra') {
    const standard = Number(snapshot.standard)
    const adapter = Number(snapshot.providerAdapter)
    if (!Number.isFinite(standard) || !Number.isFinite(adapter)) return null
    return {
      metricId: 'astra-arc-agi-3',
      value: {
        headline: `${standard}%`,
        secondary: `standard harness · ${adapter}% provider adapter`,
        asOf,
        approvedAt,
        sourceId,
      },
    }
  }

  return null
}

export default async (req: Request) => {
  if (!authorised(req)) return new Response('Unauthorized', { status: 401 })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const body = await req.json().catch(() => null) as { draftKey?: string; action?: 'approve' | 'reject' } | null
  if (!body?.draftKey?.startsWith('drafts/') || !['approve', 'reject'].includes(body.action ?? '')) {
    return Response.json({ error: 'Invalid review request' }, { status: 400 })
  }

  const store = getStore('tic-source-monitoring', { consistency: 'strong' })
  const draft = await store.get(body.draftKey, { type: 'json' }) as Draft | null
  if (!draft) return Response.json({ error: 'Draft not found' }, { status: 404 })
  if (draft.status !== 'pending-review') return Response.json({ error: 'Draft already reviewed' }, { status: 409 })

  const reviewedAt = new Date().toISOString()
  const action = body.action as 'approve' | 'reject'
  const stateKey = `state/${draft.sourceId}`
  const state = await store.get(stateKey, { type: 'json' }) as Record<string, unknown> | null

  if (action === 'approve') {
    await store.setJSON(`baselines/${draft.sourceId}`, draft.candidateSnapshot)
    await store.delete(`ignored/${draft.sourceId}`)

    const override = publicOverride(draft.sourceId, draft.candidateSnapshot, reviewedAt)
    if (override) await store.setJSON(`overrides/${override.metricId}`, override.value)

    if (state) {
      await store.setJSON(stateKey, {
        ...state,
        publishedSnapshot: draft.candidateSnapshot,
        currentSnapshot: draft.candidateSnapshot,
        pendingReview: false,
        changeDetectedAt: undefined,
        lastError: undefined,
      })
    }
  } else {
    await store.setJSON(`ignored/${draft.sourceId}`, draft.candidateSnapshot)
    if (state) {
      await store.setJSON(stateKey, {
        ...state,
        pendingReview: false,
        changeDetectedAt: undefined,
      })
    }
  }

  const reviewedDraft: Draft = { ...draft, status: action === 'approve' ? 'approved' : 'rejected', reviewedAt, action }
  await store.setJSON(body.draftKey, reviewedDraft)
  await store.setJSON(`audit/${reviewedAt}-${draft.sourceId}-${action}`, {
    sourceId: draft.sourceId,
    sourceLabel: draft.sourceLabel,
    sourceUrl: draft.sourceUrl,
    metricIds: draft.metricIds,
    action,
    reviewedAt,
    publishedSnapshot: draft.publishedSnapshot,
    candidateSnapshot: draft.candidateSnapshot,
  })

  return Response.json({ ok: true, action, reviewedAt, published: action === 'approve' && Boolean(publicOverride(draft.sourceId, draft.candidateSnapshot, reviewedAt)) }, {
    headers: { 'cache-control': 'no-store' },
  })
}

export const config: Config = {
  path: '/api/review-action',
}
