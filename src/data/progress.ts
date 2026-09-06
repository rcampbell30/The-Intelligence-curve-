export type BenchmarkJump = {
  name: string
  beforeLabel: string
  afterLabel: string
  before: number
  after: number
  source: string
  sourceUrl: string
  note?: string
}

export const benchmarkJumps: BenchmarkJump[] = [
  {
    name: 'ARC-AGI-3',
    beforeLabel: 'Frontier AI · Mar 2026',
    afterLabel: 'Astra standard harness · Sep 2026',
    before: 0.51,
    after: 62.7,
    source: 'ARC Prize',
    sourceUrl: 'https://arcprize.org/blog/astra',
    note: 'Astra also reached 99.9% with its provider-adapter harness; harness configurations are intentionally kept separate.',
  },
  {
    name: 'OSWorld',
    beforeLabel: 'Frontier · 2025',
    afterLabel: 'Frontier · 2026 AI Index',
    before: 12,
    after: 66.3,
    source: 'Stanford AI Index 2026',
    sourceUrl: 'https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance',
    note: 'Stanford reports the later score as within six percentage points of human performance.',
  },
  {
    name: 'Terminal-Bench 2.0',
    beforeLabel: 'Feb 2025',
    afterLabel: 'Early 2026',
    before: 20,
    after: 77.3,
    source: 'Stanford AI Index 2026',
    sourceUrl: 'https://hai.stanford.edu/assets/files/ai_index_report_2026.pdf',
  },
]

export const dataCenterFrontier = [
  { date: 'Aug 2024', h100e: 80000, label: 'Google Papillion' },
  { date: 'Sep 2024', h100e: 100000, label: 'Colossus 1' },
  { date: 'Feb 2025', h100e: 200000, label: 'Colossus 1' },
  { date: 'Jun 2025', h100e: 300000, label: 'Anthropic–Amazon New Carlisle' },
  { date: 'Oct 2025', h100e: 370000, label: 'Microsoft Fairwater Atlanta' },
  { date: 'Dec 2025', h100e: 470000, label: 'Anthropic–Amazon New Carlisle' },
  { date: 'Feb 2026', h100e: 490000, label: 'Meta Prometheus' },
  { date: 'Mar 2026', h100e: 690000, label: 'Anthropic–Amazon New Carlisle' },
  { date: 'May 2026', h100e: 760000, label: 'Meta Prometheus' },
]

export const timeHorizonModels = [
  { model: 'GPT-4 0314', minutes: 3.5 },
  { model: 'Claude 3.7', minutes: 60 },
  { model: 'Claude Opus 4', minutes: 101 },
  { model: 'o3', minutes: 121 },
  { model: 'GPT-5', minutes: 214 },
  { model: 'Claude Opus 4.5', minutes: 320 },
]

export const evidenceSources = {
  dataCenters: {
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/largest-data-center-compute',
    note: 'Observed-frontier records only. Planned future facilities are excluded from this series.',
  },
  timeHorizon: {
    source: 'METR · Time Horizon 1.1',
    sourceUrl: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/',
    note: '50% task-completion horizon. Human task duration is measured in minutes; confidence intervals are omitted here for readability and remain available at source.',
  },
}
