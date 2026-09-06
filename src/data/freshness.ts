export type FreshnessStatus = 'current' | 'due' | 'stale'

export type MetricFreshness = {
  lastVerified: string
  reviewEveryDays: number
  reviewLabel: string
  sourceVersion?: string
  note?: string
}

export const freshnessByMetric: Record<string, MetricFreshness> = {
  'global-compute-capacity': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 14,
    reviewLabel: 'Fortnightly source review',
    sourceVersion: 'Epoch Trends · 5 Feb 2026',
    note: 'Verification checks whether Epoch has revised the fitted rate or methodology.',
  },
  'training-compute': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 14,
    reviewLabel: 'Fortnightly source review',
    sourceVersion: 'Epoch Trends · 5 Feb 2026',
  },
  'context-windows': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 14,
    reviewLabel: 'Fortnightly source review',
    sourceVersion: 'Epoch Trends · 5 Feb 2026',
  },
  'software-efficiency': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 14,
    reviewLabel: 'Fortnightly source review',
    sourceVersion: 'Epoch Trends · 5 Feb 2026',
  },
  'training-cost': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 14,
    reviewLabel: 'Fortnightly source review',
    sourceVersion: 'Epoch Trends · 5 Feb 2026',
  },
  'chip-price-performance': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 30,
    reviewLabel: 'Monthly source review',
    sourceVersion: 'Epoch Trends · 5 Feb 2026',
  },
  'inference-price': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 30,
    reviewLabel: 'Monthly source review',
    sourceVersion: 'Epoch inference-price analysis · 12 Mar 2025',
    note: 'A historical fit can remain valid without a new publication; verification checks for a successor analysis or methodology change.',
  },
  'agent-time-horizon': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 7,
    reviewLabel: 'Weekly source review',
    sourceVersion: 'METR Time Horizon 1.1 · 29 Jan 2026',
    note: 'High-priority watch because new frontier-model evaluations can extend the series.',
  },
  'eci-frontier': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 7,
    reviewLabel: 'Weekly source review',
    sourceVersion: 'Epoch ECI frontier trend · Sep 2026',
  },
  'hle-frontier': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 3,
    reviewLabel: 'Every 3 days',
    sourceVersion: 'Scale HLE leaderboard snapshot · 6 Sep 2026',
    note: 'Leaderboard metrics are checked more often because the frontier can move as soon as a new model is evaluated.',
  },
  'astra-arc-agi-3': {
    lastVerified: '2026-09-06',
    reviewEveryDays: 7,
    reviewLabel: 'Weekly source review',
    sourceVersion: 'ARC Prize Astra result · 3 Sep 2026',
    note: 'Harness-specific result; verification includes checking whether the evaluator changes harness or scoring guidance.',
  },
}

function parseUtcDate(value: string) {
  return new Date(`${value}T00:00:00Z`)
}

export function getFreshness(metricId: string, now = new Date()) {
  const config = freshnessByMetric[metricId]
  if (!config) return undefined

  const verified = parseUtcDate(config.lastVerified)
  const due = new Date(verified)
  due.setUTCDate(due.getUTCDate() + config.reviewEveryDays)
  const stale = new Date(verified)
  stale.setUTCDate(stale.getUTCDate() + config.reviewEveryDays * 3)

  let status: FreshnessStatus = 'current'
  if (now >= stale) status = 'stale'
  else if (now >= due) status = 'due'

  return {
    ...config,
    status,
    dueDate: due.toISOString().slice(0, 10),
  }
}

export function formatFreshnessDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parseUtcDate(value))
}
