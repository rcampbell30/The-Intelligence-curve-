import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

type Snapshot = Record<string, string | number>

type MonitorDefinition = {
  id: string
  label: string
  url: string
  metricIds: string[]
  publishedSnapshot: Snapshot
  parse: (text: string) => Snapshot
}

type MonitorState = {
  id: string
  label: string
  url: string
  metricIds: string[]
  lastChecked: string
  lastSuccess?: string
  lastError?: string
  currentSnapshot?: Snapshot
  publishedSnapshot: Snapshot
  pendingReview: boolean
  changeDetectedAt?: string
}

const STORE_NAME = 'tic-source-monitoring'

function htmlToText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function requireMatch(match: RegExpMatchArray | null, source: string) {
  if (!match?.[1]) throw new Error(`Could not parse ${source}`)
  return match[1].trim()
}

const monitors: MonitorDefinition[] = [
  {
    id: 'hle-leaderboard',
    label: "Humanity's Last Exam leaderboard",
    url: 'https://labs.scale.com/leaderboard/humanitys_last_exam',
    metricIds: ['hle-frontier'],
    publishedSnapshot: { leader: 'Fable 5.1 (xhigh)', score: 46.5 },
    parse: (text) => {
      const section = text.split('Performance Comparison')[1]?.slice(0, 2600) ?? text
      const match = section.match(/\b1\s+(.{2,100}?)\s+(\d{1,3}\.\d{2})\s*±/i)
      if (!match?.[1] || !match?.[2]) throw new Error('Could not parse HLE leaderboard leader')
      return { leader: match[1].trim(), score: Number(match[2]) }
    },
  },
  {
    id: 'metr-time-horizons',
    label: 'METR Time Horizons',
    url: 'https://metr.org/time-horizons/',
    metricIds: ['agent-time-horizon'],
    publishedSnapshot: { lastUpdated: 'May 8, 2026', methodology: 'Time Horizon 1.1' },
    parse: (text) => {
      const lastUpdated = requireMatch(text.match(/LAST UPDATED\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i), 'METR last-updated date')
      const methodology = text.match(/Time Horizon\s+(\d+\.\d+)\s*\(Current\)/i)?.[1]
      if (!methodology) throw new Error('Could not parse METR current methodology version')
      return { lastUpdated, methodology: `Time Horizon ${methodology}` }
    },
  },
  {
    id: 'arc-agi-3-astra',
    label: 'ARC-AGI-3 Astra results',
    url: 'https://arcprize.org/results/openai-gpt-6-astra',
    metricIds: ['astra-arc-agi-3'],
    publishedSnapshot: { standard: 62.7, providerAdapter: 99.9 },
    parse: (text) => {
      const standardMatch = text.match(/Standard harness[\s\S]{0,650}?was\s+(\d{1,3}(?:\.\d+)?)%/i)
      const adapterMatch = text.match(/Provider Adapter harness[\s\S]{0,800}?best observed result was\s+(\d{1,3}(?:\.\d+)?)%/i)
      if (!standardMatch?.[1] || !adapterMatch?.[1]) throw new Error('Could not parse ARC-AGI-3 Astra results')
      return { standard: Number(standardMatch[1]), providerAdapter: Number(adapterMatch[1]) }
    },
  },
]

function snapshotsEqual(a: Snapshot, b: Snapshot) {
  return JSON.stringify(a) === JSON.stringify(b)
}

async function fetchSource(url: string) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'The-Intelligence-Curve-Monitor/1.0 (+https://intelligencecurve.netlify.app)' },
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return htmlToText(await response.text())
}

export default async () => {
  const store = getStore(STORE_NAME, { consistency: 'strong' })
  const checkedAt = new Date().toISOString()

  for (const monitor of monitors) {
    const previous = await store.get(`state/${monitor.id}`, { type: 'json' }) as MonitorState | null

    try {
      const text = await fetchSource(monitor.url)
      const currentSnapshot = monitor.parse(text)
      const pendingReview = !snapshotsEqual(currentSnapshot, monitor.publishedSnapshot)
      const changeDetectedAt = pendingReview
        ? (previous?.pendingReview ? previous.changeDetectedAt : checkedAt)
        : undefined

      const state: MonitorState = {
        id: monitor.id,
        label: monitor.label,
        url: monitor.url,
        metricIds: monitor.metricIds,
        lastChecked: checkedAt,
        lastSuccess: checkedAt,
        currentSnapshot,
        publishedSnapshot: monitor.publishedSnapshot,
        pendingReview,
        ...(changeDetectedAt ? { changeDetectedAt } : {}),
      }

      await store.setJSON(`state/${monitor.id}`, state)

      if (pendingReview && !previous?.pendingReview) {
        await store.setJSON(`drafts/${checkedAt}-${monitor.id}`, {
          sourceId: monitor.id,
          sourceLabel: monitor.label,
          sourceUrl: monitor.url,
          metricIds: monitor.metricIds,
          detectedAt: checkedAt,
          publishedSnapshot: monitor.publishedSnapshot,
          candidateSnapshot: currentSnapshot,
          status: 'pending-review',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown monitor error'
      const state: MonitorState = {
        id: monitor.id,
        label: monitor.label,
        url: monitor.url,
        metricIds: monitor.metricIds,
        lastChecked: checkedAt,
        lastSuccess: previous?.lastSuccess,
        lastError: message,
        currentSnapshot: previous?.currentSnapshot,
        publishedSnapshot: monitor.publishedSnapshot,
        pendingReview: previous?.pendingReview ?? false,
        changeDetectedAt: previous?.changeDetectedAt,
      }
      await store.setJSON(`state/${monitor.id}`, state)
      console.error(`[source-monitor] ${monitor.id}: ${message}`)
    }
  }
}

export const config: Config = {
  schedule: '15 6 * * *',
}
