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
type PublishedOverride = { metricId: string; value: Record<string, string | number> }

function authorised(req: Request) {
  const expected = Netlify.env.get('TIC_REVIEW_KEY')
  const provided = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return Boolean(expected && provided && expected === provided)
}

function approvedDate(approvedAt: string) {
  return approvedAt.slice(0, 10)
}

function sourceDate(value: unknown, approvedAt: string) {
  if (typeof value === 'string') {
    const parsed = new Date(value.replace(/\bSept\.?\b/i, 'Sep'))
    if (Number.isFinite(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  }
  return approvedDate(approvedAt)
}

function n(snapshot: Snapshot, key: string) {
  const value = Number(snapshot[key])
  return Number.isFinite(value) ? value : null
}

function publicOverrides(sourceId: string, snapshot: Snapshot, approvedAt: string): PublishedOverride[] {
  if (sourceId === 'hle-leaderboard') {
    const score = n(snapshot, 'score')
    const leader = String(snapshot.leader ?? '')
    if (score === null || !leader) return []
    return [{
      metricId: 'hle-frontier',
      value: {
        headline: `${score.toFixed(2)}%`,
        secondary: `current leaderboard leader · ${leader}`,
        summary: `Scale’s current HLE leaderboard has a frontier score of ${score.toFixed(2)}%, up from low-single-digit scores when the benchmark was introduced.`,
        detailInterpretation: `The current dated snapshot is ${score.toFixed(2)}%, versus low-single-digit frontier results when the benchmark was introduced.`,
        seriesValue: score,
        seriesDetail: leader,
        asOf: approvedDate(approvedAt),
        approvedAt,
        sourceId,
      },
    }]
  }

  if (sourceId === 'arc-agi-3-astra') {
    const standard = n(snapshot, 'standard')
    const adapter = n(snapshot, 'providerAdapter')
    if (standard === null || adapter === null) return []
    return [{
      metricId: 'astra-arc-agi-3',
      value: {
        headline: `${standard}%`,
        secondary: `standard harness · ${adapter}% provider adapter`,
        summary: `ARC Prize reports GPT-6 Astra at ${standard}% on ARC-AGI-3 Semi-Private with the standard harness and ${adapter}% with the provider-adapter configuration.`,
        detailInterpretation: `Astra scored ${standard}% under the standard harness and ${adapter}% using a provider-adapter configuration. Those are intentionally kept separate.`,
        asOf: approvedDate(approvedAt),
        approvedAt,
        sourceId,
      },
    }]
  }

  if (sourceId === 'epoch-eci-frontier') {
    const reasoning = n(snapshot, 'reasoningRate')
    const nonReasoning = n(snapshot, 'nonReasoningRate')
    if (reasoning === null || nonReasoning === null) return []
    return [{
      metricId: 'eci-frontier',
      value: {
        headline: `+${reasoning} ECI / year`,
        secondary: `reasoning frontier · ~${nonReasoning} ECI / year before reasoning`,
        summary: `Epoch AI reports the reasoning-model ECI frontier advancing by about ${reasoning} index points per year, versus about ${nonReasoning} for the earlier non-reasoning frontier.`,
        detailInterpretation: `The approved Epoch source snapshot reports a reasoning-era fitted frontier slope of about ${reasoning} ECI points per year versus about ${nonReasoning} before reasoning models.`,
        asOf: sourceDate(snapshot.dataUpdated, approvedAt),
        approvedAt,
        sourceId,
      },
    }]
  }

  if (sourceId === 'epoch-core-trends') {
    const stock = n(snapshot, 'computeStockAnnual')
    const stockMonths = n(snapshot, 'computeStockDoublingMonths')
    const training = n(snapshot, 'trainingComputeAnnual')
    const trainingMonths = n(snapshot, 'trainingComputeDoublingMonths')
    const context = n(snapshot, 'contextWindowAnnual')
    const contextMonths = n(snapshot, 'contextWindowDoublingMonths')
    if ([stock, stockMonths, training, trainingMonths, context, contextMonths].some((value) => value === null)) return []
    const asOf = sourceDate(snapshot.pageUpdated, approvedAt)
    return [
      {
        metricId: 'global-compute-capacity',
        value: {
          headline: `${stock}× / year`, secondary: `${stockMonths} month doubling time`,
          summary: `Epoch AI estimates the total computing power of the global stock of AI chips has grown at about ${stock}× per year over its fitted period.`,
          detailInterpretation: `The approved Epoch trend snapshot corresponds to about ${stock}× annual growth and a ${stockMonths}-month doubling time.`,
          asOf, approvedAt, sourceId,
        },
      },
      {
        metricId: 'training-compute',
        value: {
          headline: `${training}× / year`, secondary: `${trainingMonths} month doubling time`,
          summary: `Epoch AI reports frontier language-model training compute growing at about ${training}× per year over the fitted period.`,
          detailInterpretation: `The approved Epoch trend snapshot corresponds to about ${training}× annual growth and a ${trainingMonths}-month doubling time.`,
          asOf, approvedAt, sourceId,
        },
      },
      {
        metricId: 'context-windows',
        value: {
          headline: `${context}× / year`, secondary: `${contextMonths} month doubling time`,
          summary: `Epoch AI estimates frontier LLM context-window size has grown at about ${context}× per year over the fitted period.`,
          detailInterpretation: `The approved Epoch trend snapshot corresponds to about ${context}× annual growth and a ${contextMonths}-month doubling time. Context length remains an input-capacity measure, not a direct intelligence measure.`,
          asOf, approvedAt, sourceId,
        },
      },
    ]
  }

  if (sourceId === 'epoch-chip-price-performance') {
    const annual = n(snapshot, 'annualGrowthPercent')
    const years = n(snapshot, 'doublingYears')
    if (annual === null || years === null) return []
    return [{
      metricId: 'chip-price-performance',
      value: {
        headline: `+${annual}% / year`,
        secondary: `${years} year doubling time`,
        summary: `Epoch AI estimates spending-weighted AI-chip performance per dollar has improved by about ${annual}% per year over the fitted period.`,
        detailInterpretation: `The approved Epoch source snapshot reports about ${annual}% annual improvement, corresponding to a ${years}-year doubling time in performance per dollar.`,
        asOf: sourceDate(snapshot.dataUpdated, approvedAt),
        approvedAt,
        sourceId,
      },
    }]
  }

  if (sourceId === 'epoch-inference-price') {
    const median = n(snapshot, 'medianAnnualDecline')
    const low = n(snapshot, 'rangeLow')
    const high = n(snapshot, 'rangeHigh')
    const recent = n(snapshot, 'recentMedianAnnualDecline')
    if (median === null || low === null || high === null || recent === null) return []
    return [{
      metricId: 'inference-price',
      value: {
        headline: `~${median}× cheaper / year`,
        secondary: `median historical fit · recent subset ~${recent}× / year`,
        summary: `Epoch AI’s approved analysis reports a median fitted inference-price decline of about ${median}× per year across studied capability thresholds, with task-specific fits spanning roughly ${low}× to ${high}×.`,
        detailInterpretation: `The approved source snapshot keeps the median ${median}× annual decline alongside its very wide ${low}×–${high}× task-specific range; it is not a universal price law or forecast.`,
        asOf: approvedDate(approvedAt),
        approvedAt,
        sourceId,
      },
    }]
  }

  return []
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
    summary: 'A monitored source change was reviewed and approved into The Intelligence Curve’s accepted evidence layer.',
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
  const overrides = action === 'approve' ? publicOverrides(draft.sourceId, draft.candidateSnapshot, reviewedAt) : []
  const publicUpdate = action === 'approve' ? publicUpdateForDraft(draft, reviewedAt) : null

  if (action === 'approve') {
    await store.setJSON(`baselines/${draft.sourceId}`, draft.candidateSnapshot)
    await store.delete(`ignored/${draft.sourceId}`)
    await Promise.all(overrides.map((override) => store.setJSON(`overrides/${override.metricId}`, override.value)))
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
    publishedOverrides: overrides,
    publicUpdate: publicUpdate ?? null,
  })

  return Response.json({
    ok: true,
    action,
    reviewedAt,
    published: overrides.length > 0,
    publishedMetrics: overrides.map((override) => override.metricId),
    movementPublished: Boolean(publicUpdate),
  }, {
    headers: { 'cache-control': 'no-store' },
  })
}

export const config: Config = {
  path: '/api/review-action',
}
