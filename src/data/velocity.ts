export type VelocityDirection = 'doubling' | 'halving'

export type VelocityRow = {
  id: string
  label: string
  months: number
  direction: VelocityDirection
  evidence: 'trend-fit'
  source: string
  sourceUrl: string
  note: string
  metricPath: string
}

export const velocityRows: VelocityRow[] = [
  {
    id: 'inference-price',
    label: 'Inference price',
    months: 2.1,
    direction: 'halving',
    evidence: 'trend-fit',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/llm-inference-price-trends',
    note: 'Median fitted price decline at fixed capability, converted from ~50× cheaper/year.',
    metricPath: '/metric/inference-price',
  },
  {
    id: 'context-windows',
    label: 'Context windows',
    months: 2.4,
    direction: 'doubling',
    evidence: 'trend-fit',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    note: 'Frontier LLM context-window size since 2023.',
    metricPath: '/metric/context-windows',
  },
  {
    id: 'agent-time-horizon',
    label: 'Agent task horizon',
    months: 4.3,
    direction: 'doubling',
    evidence: 'trend-fit',
    source: 'METR',
    sourceUrl: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/',
    note: 'TH1.1 post-2023 50% task-completion horizon; 131 days ≈ 4.3 months.',
    metricPath: '/metric/agent-time-horizon',
  },
  {
    id: 'training-compute',
    label: 'Training compute',
    months: 5.2,
    direction: 'doubling',
    evidence: 'trend-fit',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    note: 'Frontier language-model training compute since 2020.',
    metricPath: '/metric/training-compute',
  },
  {
    id: 'global-compute-capacity',
    label: 'Global compute stock',
    months: 6.8,
    direction: 'doubling',
    evidence: 'trend-fit',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    note: 'Total computing power of the global AI-chip stock.',
    metricPath: '/metric/global-compute-capacity',
  },
  {
    id: 'training-cost',
    label: 'Training cost',
    months: 7.0,
    direction: 'doubling',
    evidence: 'trend-fit',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    note: 'Frontier language-model training cost since 2020.',
    metricPath: '/metric/training-cost',
  },
  {
    id: 'software-efficiency',
    label: 'Software efficiency',
    months: 7.6,
    direction: 'doubling',
    evidence: 'trend-fit',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    note: 'Improvement in pre-training compute efficiency.',
    metricPath: '/metric/software-efficiency',
  },
  {
    id: 'data-centre-power',
    label: 'Data-centre power',
    months: 10.0,
    direction: 'doubling',
    evidence: 'trend-fit',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/frontier-data-center-power',
    note: 'Historical fit to observed frontier data-centre IT power records.',
    metricPath: '/scaling',
  },
  {
    id: 'chip-price-performance',
    label: 'Chip perf / $',
    months: 20.4,
    direction: 'doubling',
    evidence: 'trend-fit',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/chip-performance-per-dollar',
    note: 'Spending-weighted AI-chip performance per dollar since 2023.',
    metricPath: '/metric/chip-price-performance',
  },
]
