export type MetricCategory = 'Scaling' | 'Agents' | 'Benchmarks' | 'Economics'

export type Metric = {
  id: string
  category: MetricCategory
  label: string
  headline: string
  secondary: string
  summary: string
  source: string
  sourceUrl: string
  asOf: string
  evidenceKind: 'trend-fit' | 'benchmark-result'
  caution?: string
}

export const metrics: Metric[] = [
  {
    id: 'global-compute-capacity',
    category: 'Scaling',
    label: 'Global AI compute stock',
    headline: '3.4× / year',
    secondary: '6.8 month doubling time',
    summary: 'Epoch AI estimates the total computing power of the global stock of AI chips has grown at this rate since 2022.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    asOf: '2026-02-05',
    evidenceKind: 'trend-fit',
    caution: 'A fitted historical trend, not a forecast that the rate will continue.',
  },
  {
    id: 'training-compute',
    category: 'Scaling',
    label: 'Frontier training compute',
    headline: '5× / year',
    secondary: '5.2 month doubling time',
    summary: 'Epoch AI reports this trend for frontier language-model training compute since 2020.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    asOf: '2026-02-05',
    evidenceKind: 'trend-fit',
  },
  {
    id: 'context-windows',
    category: 'Scaling',
    label: 'LLM context windows',
    headline: '30× / year',
    secondary: '2.4 month doubling time',
    summary: 'Epoch AI estimates frontier LLM context-window size has grown at this rate since 2023.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    asOf: '2026-02-05',
    evidenceKind: 'trend-fit',
    caution: 'Context length is an input-capacity measure; it is not equivalent to useful long-horizon memory or intelligence.',
  },
  {
    id: 'software-efficiency',
    category: 'Economics',
    label: 'Pre-training compute efficiency',
    headline: '3× / year',
    secondary: '7.6 month doubling time',
    summary: 'The compute needed to reach the same pre-training performance is falling by roughly a factor of three each year.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    asOf: '2026-02-05',
    evidenceKind: 'trend-fit',
  },
  {
    id: 'training-cost',
    category: 'Economics',
    label: 'Frontier training cost',
    headline: '3.5× / year',
    secondary: '7 month doubling time',
    summary: 'Epoch AI estimates the cost of frontier language-model training runs has increased at this rate since 2020.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    asOf: '2026-02-05',
    evidenceKind: 'trend-fit',
  },
  {
    id: 'chip-price-performance',
    category: 'Economics',
    label: 'AI chip performance / dollar',
    headline: '+49% / year',
    secondary: '1.7 year doubling time',
    summary: 'Epoch AI estimates spending-weighted AI-chip performance per dollar has improved by roughly half each year since 2023.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    asOf: '2026-02-05',
    evidenceKind: 'trend-fit',
  },
  {
    id: 'agent-time-horizon',
    category: 'Agents',
    label: 'Autonomous task horizon',
    headline: '131 days',
    secondary: 'post-2023 doubling time · TH1.1',
    summary: 'METR estimates how quickly the length of software tasks frontier agents can complete with 50% reliability is increasing.',
    source: 'METR',
    sourceUrl: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/',
    asOf: '2026-01-29',
    evidenceKind: 'trend-fit',
    caution: 'This is the doubling time of the task horizon, not a 131-day task. The estimate is sensitive to task composition and methodology.',
  },
  {
    id: 'eci-frontier',
    category: 'Benchmarks',
    label: 'Epoch Capabilities Index frontier',
    headline: '+14 ECI / year',
    secondary: 'since reasoning models arrived',
    summary: 'Epoch AI reports the ECI frontier advancing by about fourteen index points per year since September 2024.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    asOf: '2026-02-05',
    evidenceKind: 'trend-fit',
  },
  {
    id: 'astra-arc-agi-3',
    category: 'Benchmarks',
    label: 'Astra on ARC-AGI-3',
    headline: '62.7%',
    secondary: 'standard harness · 99.9% provider adapter',
    summary: 'ARC Prize reports state-of-the-art Semi-Private results for GPT-6 Astra under two harness configurations.',
    source: 'ARC Prize',
    sourceUrl: 'https://arcprize.org/blog/astra',
    asOf: '2026-09-03',
    evidenceKind: 'benchmark-result',
    caution: 'Harness configuration materially changes the result, so both scores should always be shown together.',
  },
]

export const categories = [
  {
    name: 'Trends',
    path: '/trends',
    eyebrow: 'The big picture',
    description: 'The clearest long-run curves across capability, compute, autonomy and efficiency.',
  },
  {
    name: 'Benchmarks',
    path: '/benchmarks',
    eyebrow: 'Measured capability',
    description: 'Frontier benchmark records shown historically, with harness and methodology context preserved.',
  },
  {
    name: 'Agents',
    path: '/agents',
    eyebrow: 'Autonomous work',
    description: 'How long AI systems can work, recover from errors and complete useful tasks without intervention.',
  },
  {
    name: 'Scaling',
    path: '/scaling',
    eyebrow: 'Compute & infrastructure',
    description: 'Training compute, global chip capacity, data centres, power and the physical inputs behind progress.',
  },
  {
    name: 'Timeline',
    path: '/timeline',
    eyebrow: 'Then vs now',
    description: 'A chronological view of major releases, benchmark jumps and capability milestones.',
  },
  {
    name: 'Methodology',
    path: '/methodology',
    eyebrow: 'Trust the graph',
    description: 'Sources, definitions, update rules and the line between observed data and extrapolation.',
  },
] as const
