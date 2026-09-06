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
    .replace(/&times;|&#215;/gi, '×')
    .replace(/\s+/g, ' ')
    .trim()
}

function requireMatch(match: RegExpMatchArray | null, source: string) {
  if (!match?.[1]) throw new Error(`Could not parse ${source}`)
  return match[1].trim()
}

function requireNumber(match: RegExpMatchArray | null, source: string) {
  const value = Number(requireMatch(match, source))
  if (!Number.isFinite(value)) throw new Error(`Could not parse numeric ${source}`)
  return value
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
  {
    id: 'epoch-eci-frontier',
    label: 'Epoch ECI frontier trend',
    url: 'https://epoch.ai/data-insights/eci-frontier-trend',
    metricIds: ['eci-frontier'],
    publishedSnapshot: { reasoningRate: 14, nonReasoningRate: 6, dataUpdated: 'Sep. 1, 2026' },
    parse: (text) => ({
      reasoningRate: requireNumber(text.match(/advanced linearly by\s+(\d+(?:\.\d+)?)\s+points per year/i), 'ECI reasoning rate'),
      nonReasoningRate: requireNumber(text.match(/compared with\s+(\d+(?:\.\d+)?)\s+points per year for non-reasoning/i), 'ECI non-reasoning rate'),
      dataUpdated: requireMatch(text.match(/CSV,?\s+Updated\s+([A-Za-z]{3,9}\.?\s+\d{1,2},\s+\d{4})/i), 'ECI data update date'),
    }),
  },
  {
    id: 'epoch-core-trends',
    label: 'Epoch core AI scaling trends',
    url: 'https://epoch.ai/trends',
    metricIds: ['global-compute-capacity', 'training-compute', 'context-windows'],
    publishedSnapshot: {
      pageUpdated: 'Feb. 5, 2026',
      computeStockAnnual: 3.4,
      computeStockDoublingMonths: 6.8,
      trainingComputeAnnual: 5,
      trainingComputeDoublingMonths: 5.2,
      contextWindowAnnual: 30,
      contextWindowDoublingMonths: 2.4,
    },
    parse: (text) => ({
      pageUpdated: requireMatch(text.match(/Updated\s+([A-Za-z]{3,9}\.?\s+\d{1,2},\s+\d{4})/i), 'Epoch Trends update date'),
      computeStockAnnual: requireNumber(text.match(/Compute stock growth\s+(\d+(?:\.\d+)?)\s*[×x]\s*\/year/i), 'compute-stock annual growth'),
      computeStockDoublingMonths: requireNumber(text.match(/Compute stock growth[\s\S]{0,100}?(\d+(?:\.\d+)?)\s*months/i), 'compute-stock doubling time'),
      trainingComputeAnnual: requireNumber(text.match(/Training compute\s+(\d+(?:\.\d+)?)\s*[×x]\s*\/year/i), 'training-compute annual growth'),
      trainingComputeDoublingMonths: requireNumber(text.match(/Training compute[\s\S]{0,100}?(\d+(?:\.\d+)?)\s*months/i), 'training-compute doubling time'),
      contextWindowAnnual: requireNumber(text.match(/LLM context windows\s+(\d+(?:\.\d+)?)\s*[×x]\s*\/year/i), 'context-window annual growth'),
      contextWindowDoublingMonths: requireNumber(text.match(/LLM context windows[\s\S]{0,100}?(\d+(?:\.\d+)?)\s*months/i), 'context-window doubling time'),
    }),
  },
  {
    id: 'epoch-data-center-compute',
    label: 'Epoch frontier data-centre compute',
    url: 'https://epoch.ai/data-insights/largest-data-center-compute',
    metricIds: [],
    publishedSnapshot: { trendAnnual: 3.3, doublingMonths: 7, dataUpdated: 'Jun. 11, 2026' },
    parse: (text) => ({
      trendAnnual: requireNumber(text.match(/resulting in the\s+(\d+(?:\.\d+)?)\s*[x×]\s*per year growth trend/i), 'data-centre compute growth rate'),
      doublingMonths: requireNumber(text.match(/equivalent to a doubling time of\s+(\d+(?:\.\d+)?)\s+months/i), 'data-centre compute doubling time'),
      dataUpdated: requireMatch(text.match(/CSV,?\s+Updated\s+([A-Za-z]{3,9}\.?\s+\d{1,2},\s+\d{4})/i), 'data-centre compute update date'),
    }),
  },
  {
    id: 'epoch-data-center-power',
    label: 'Epoch frontier data-centre power',
    url: 'https://epoch.ai/data-insights/frontier-data-center-power',
    metricIds: [],
    publishedSnapshot: { doublingMonths: 10, currentRecordMW: 950, dataUpdated: 'Aug. 31, 2026' },
    parse: (text) => ({
      doublingMonths: requireNumber(text.match(/doubled every\s+(\d+(?:\.\d+)?)\s+months/i), 'data-centre power doubling time'),
      currentRecordMW: requireNumber(text.match(/current record-holder[^.]{0,180}?estimated\s+(\d+(?:\.\d+)?)\s*MW/i), 'data-centre power record'),
      dataUpdated: requireMatch(text.match(/CSV,?\s+Updated\s+([A-Za-z]{3,9}\.?\s+\d{1,2},\s+\d{4})/i), 'data-centre power update date'),
    }),
  },
  {
    id: 'epoch-chip-price-performance',
    label: 'Epoch AI-chip performance per dollar',
    url: 'https://epoch.ai/data-insights/chip-performance-per-dollar',
    metricIds: ['chip-price-performance'],
    publishedSnapshot: { annualGrowthPercent: 49, doublingYears: 1.7, dataUpdated: 'Aug. 13, 2026' },
    parse: (text) => ({
      annualGrowthPercent: requireNumber(text.match(/average growth rate of about\s+(\d+(?:\.\d+)?)%\s+per year/i), 'chip performance-per-dollar growth'),
      doublingYears: requireNumber(text.match(/doubling time of\s+(\d+(?:\.\d+)?)\s+years/i), 'chip performance-per-dollar doubling time'),
      dataUpdated: requireMatch(text.match(/CSV,?\s+Updated\s+([A-Za-z]{3,9}\.?\s+\d{1,2},\s+\d{4})/i), 'chip performance-per-dollar update date'),
    }),
  },
  {
    id: 'epoch-inference-price',
    label: 'Epoch inference-price trend analysis',
    url: 'https://epoch.ai/data-insights/llm-inference-price-trends',
    metricIds: ['inference-price'],
    publishedSnapshot: { medianAnnualDecline: 50, rangeLow: 9, rangeHigh: 900, recentMedianAnnualDecline: 200 },
    parse: (text) => ({
      medianAnnualDecline: requireNumber(text.match(/median of\s+(\d+(?:\.\d+)?)\s*[x×]\s*per year/i), 'inference-price median decline'),
      rangeLow: requireNumber(text.match(/declining between\s+(\d+(?:\.\d+)?)\s*[x×]\s*per year/i), 'inference-price lower range'),
      rangeHigh: requireNumber(text.match(/between\s+\d+(?:\.\d+)?\s*[x×]\s*per year and\s+(\d+(?:\.\d+)?)\s*[x×]\s*per year/i), 'inference-price upper range'),
      recentMedianAnnualDecline: requireNumber(text.match(/median rate increased from\s+\d+(?:\.\d+)?\s*[x×]\s*per year to\s+(\d+(?:\.\d+)?)\s*[x×]\s*per year/i), 'recent inference-price median decline'),
    }),
  },
]

function snapshotsEqual(a?: Snapshot | null, b?: Snapshot | null) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
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

  await Promise.all(monitors.map(async (monitor) => {
    const [previous, approvedBaseline, ignoredCandidate] = await Promise.all([
      store.get(`state/${monitor.id}`, { type: 'json' }) as Promise<MonitorState | null>,
      store.get(`baselines/${monitor.id}`, { type: 'json' }) as Promise<Snapshot | null>,
      store.get(`ignored/${monitor.id}`, { type: 'json' }) as Promise<Snapshot | null>,
    ])
    const publishedSnapshot = approvedBaseline ?? monitor.publishedSnapshot

    try {
      const text = await fetchSource(monitor.url)
      const currentSnapshot = monitor.parse(text)
      const changed = !snapshotsEqual(currentSnapshot, publishedSnapshot)
      const explicitlyIgnored = changed && snapshotsEqual(currentSnapshot, ignoredCandidate)
      const pendingReview = changed && !explicitlyIgnored
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
        publishedSnapshot,
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
          publishedSnapshot,
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
        publishedSnapshot,
        pendingReview: previous?.pendingReview ?? false,
        changeDetectedAt: previous?.changeDetectedAt,
      }
      await store.setJSON(`state/${monitor.id}`, state)
      console.error(`[source-monitor] ${monitor.id}: ${message}`)
    }
  }))
}

export const config: Config = {
  schedule: '15 6 * * *',
}
