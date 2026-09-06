import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

type MonitorState = {
  id: string
  label: string
  url: string
  metricIds: string[]
  lastChecked?: string
  lastSuccess?: string
  lastError?: string
  pendingReview?: boolean
  changeDetectedAt?: string
}

const monitors = [
  { id: 'hle-leaderboard', label: "Humanity's Last Exam leaderboard", url: 'https://labs.scale.com/leaderboard/humanitys_last_exam', metricIds: ['hle-frontier'] },
  { id: 'metr-time-horizons', label: 'METR Time Horizons', url: 'https://metr.org/time-horizons/', metricIds: ['agent-time-horizon'] },
  { id: 'arc-agi-3-astra', label: 'ARC-AGI-3 Astra results', url: 'https://arcprize.org/results/openai-gpt-6-astra', metricIds: ['astra-arc-agi-3'] },
]

export default async () => {
  const store = getStore('tic-source-monitoring')
  const states = await Promise.all(monitors.map(async (monitor) => {
    const state = await store.get(`state/${monitor.id}`, { type: 'json' }) as MonitorState | null
    if (!state) {
      return {
        ...monitor,
        status: 'awaiting-first-run',
        pendingReview: false,
      }
    }

    return {
      id: monitor.id,
      label: monitor.label,
      url: monitor.url,
      metricIds: monitor.metricIds,
      status: state.lastError ? 'error' : state.pendingReview ? 'review-needed' : 'healthy',
      pendingReview: Boolean(state.pendingReview),
      lastChecked: state.lastChecked,
      lastSuccess: state.lastSuccess,
      changeDetectedAt: state.changeDetectedAt,
      error: state.lastError,
    }
  }))

  return Response.json({
    generatedAt: new Date().toISOString(),
    schedule: 'Daily at 06:15 UTC',
    monitors: states,
    pendingReviewCount: states.filter((state) => state.pendingReview).length,
  }, {
    headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' },
  })
}

export const config: Config = {
  path: '/api/monitor-status',
}
