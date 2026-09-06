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

type UpdateCategory = 'Benchmarks' | 'Agents' | 'Scaling' | 'Economics' | 'Methodology'

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
        summary: `Scale’s current HLE leaderboard has a frontier score of ${score.toFixed(2)}%, up from low-single-digit scores when the benchmark was introduced.`,
        detailInterpretation: `The current dated snapshot is ${score.toFixed(2)}%, versus low-single-digit frontier results when the benchmark was introduced.`,
        seriesValue: score,
        seriesDetail: leader,
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
        summary: `ARC Prize reports GPT-6 Astra at ${standard}% on ARC-AGI-3 Semi-Private with the standard harness and ${adapter}% with the provider-adapter configuration.`,
        detailInterpretation: `Astra scored ${standard}% under the standard harness and ${adapter}% using a provider-adapter configuration. Those are intentionally kept separate.`,
        asOf,
        approvedAt,
        sourceId,
      },
    }
  }

  return null
}

function categoryForSource(sourceId: string): UpdateCategory {
  if (sourceId === 'metr-time-horizons') return 'Agents'
  if (sourceId === 'epoch-core-trends' || sourceId === 'epoch-data-center-compute' || sourceId === 'epoch-data-center-power') return 'Scaling'
  if (sourceId === 'epoch-chip-price-performance' || sourceId === 'epoch-inference-price') return 'Economics'
  return 'Benchmarks'
}

function humanKey(key: string) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').toLowerCase()
}

function snapshotDiff(before: Snapshot, after: Snapshot) {
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
  return keys
    .filter((key) => before[key] !== after[key])
    .slice(0, 3)
    .map((key) => `${humanKey(key)} ${String(before[key] ?? '—')} → ${String(after[key] ?? '—')}`)
    .join(' · ')
}

function publicUpdateForDraft(draft: Draft, reviewedAt: string) {
  const diff = snapshotDiff(draft.publishedSnapshot, draft.candidateSnapshot)
  return {
    id: `monitored-${draft.detectedAt}-${draft.sourceId}`,
    date: reviewedAt.slice(0, 10),
    category: categoryForSource(draft.sourceId),
    title: `${draft.sourceLabel} change approved`,
    summary: `A monitored source change was reviewed and approved into The Intelligence Curve’s accepted evidence layer.`,
    source: draft.sourceLabel,
    sourceUrl: draft.sourceUrl,
    ...(draft.metricIds[0] ? { metricId: draft.metricIds[0] } : {}),
    ...(diff ? { changeLabel: diff } : {}),
    note: 'This movement entry records the approved source diff. Benchmark, harness and methodology caveats remain attached to the source and metric pages.',
  }
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
  const override = action === 'approve' ? publicOverride(draft.sourceId, draft.candidateSnapshot, reviewedAt) : null
  const publicUpdate = action === 'approve' ? publicUpdateForDraft(draft, reviewedAt) : null

  if (action === 'approve') {
    await store.setJSON(`baselines/${draft.sourceId}`, draft.candidateSnapshot)
    await store.delete(`ignored/${draft.sourceId}`)
    if (override) await store.setJSON(`overrides/${override.metricId}`, override.value)
    if (publicUpdate) await store.setJSON(`public-updates/${draft.detectedAt}-${draft.sourceId}`, publicUpdate)

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
    publishedOverride: override?.value ?? null,
    publicUpdate: publicUpdate ?? null,
  })

  return Response.json({ ok: true, action, reviewedAt, published: Boolean(override), movementPublished: Boolean(publicUpdate) }, {
    headers: { 'cache-control': 'no-store' },
  })
}

export const config: Config = {
  path: '/api/review-action',
}
