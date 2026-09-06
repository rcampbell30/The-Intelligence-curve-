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
    name: "Humanity's Last Exam",
    beforeLabel: 'GPT-4o · Nov 2024',
    afterLabel: 'Current leader · Sep 2026',
    before: 3.07,
    after: 46.5,
    source: 'Scale AI',
    sourceUrl: 'https://labs.scale.com/leaderboard/humanitys_last_exam',
    note: 'The current leaderboard is a dated snapshot and will change as new systems are evaluated.',
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
  { date: 'Sep 2026', h100e: 1100000, label: 'xAI Colossus 2' },
]

export const dataCenterPower = [
  { date: 'Aug 2024', mw: 237, label: 'Google Papillion' },
  { date: 'Feb 2025', mw: 278, label: 'Colossus 1' },
  { date: 'Jun 2025', mw: 398, label: 'Anthropic–Amazon New Carlisle' },
  { date: 'Dec 2025', mw: 626, label: 'Anthropic–Amazon New Carlisle' },
  { date: 'Mar 2026', mw: 910, label: 'Anthropic–Amazon New Carlisle' },
  { date: 'Jun 2026', mw: 946, label: 'xAI Colossus 2' },
]

export const timeHorizonModels = [
  { model: 'GPT-4 0314', minutes: 3.5 },
  { model: 'Claude 3.7', minutes: 60 },
  { model: 'Claude Opus 4', minutes: 101 },
  { model: 'o3', minutes: 121 },
  { model: 'GPT-5', minutes: 214 },
  { model: 'Claude Opus 4.5', minutes: 320 },
]

export const timelineMilestones = [
  {
    date: 'Aug 2024',
    category: 'Scaling',
    title: 'Observed data-centre compute frontier reaches ~80k H100e',
    detail: 'Google Papillion begins the record series used in the site’s physical-scale chart.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/largest-data-center-compute',
  },
  {
    date: 'Sep 2024',
    category: 'Capability',
    title: 'Reasoning-model era begins in the ECI trend',
    detail: 'Epoch measures the reasoning-model frontier from the arrival of o1-mini and o1-preview.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/eci-frontier-trend',
  },
  {
    date: 'Jan 2025',
    category: 'Benchmarks',
    title: "Humanity's Last Exam launches with frontier systems below 10%",
    detail: 'Scale AI and CAIS introduced HLE because many older academic benchmarks were already saturating.',
    source: 'Scale AI',
    sourceUrl: 'https://scale.com/blog/humanitys-last-exam-results',
  },
  {
    date: 'Jan 2026',
    category: 'Agents',
    title: 'METR releases Time Horizon 1.1',
    detail: 'The post-2023 50% task-horizon trend is estimated to double every 130.8 days.',
    source: 'METR',
    sourceUrl: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/',
  },
  {
    date: 'Jun 2026',
    category: 'Scaling',
    title: 'Observed data-centre power frontier reaches ~946 MW',
    detail: 'xAI Colossus 2 becomes the observed record-holder in Epoch’s frontier-power series.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/frontier-data-center-power',
  },
  {
    date: 'Sep 2026',
    category: 'Capability',
    title: 'Reasoning-model ECI frontier measured at +14 points/year',
    detail: 'Epoch reports a faster frontier trend after reasoning models arrived than for non-reasoning systems.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/eci-frontier-trend',
  },
  {
    date: 'Sep 2026',
    category: 'Benchmarks',
    title: "HLE frontier reaches 46.5%",
    detail: 'The current Scale leaderboard leader answers nearly half of Humanity’s Last Exam correctly.',
    source: 'Scale AI',
    sourceUrl: 'https://labs.scale.com/leaderboard/humanitys_last_exam',
  },
  {
    date: 'Sep 2026',
    category: 'Benchmarks',
    title: 'Astra reaches 62.7% on ARC-AGI-3 standard harness',
    detail: 'The provider-adapter configuration reaches 99.9%; the site keeps the two harnesses visibly separate.',
    source: 'ARC Prize',
    sourceUrl: 'https://arcprize.org/blog/astra',
  },
]

export const evidenceSources = {
  dataCenters: {
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    note: 'Observed-frontier records only. Planned future facilities are excluded from this series.',
  },
  dataCenterPower: {
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/frontier-data-center-power',
    note: 'Observed power records only; Epoch estimates a 10-month doubling time from six historical record events.',
  },
  timeHorizon: {
    source: 'METR · Time Horizon 1.1',
    sourceUrl: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/',
    note: '50% task-completion horizon. Human task duration is measured in minutes; confidence intervals are omitted here for readability and remain available at source.',
  },
}
