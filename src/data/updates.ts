export type UpdateCategory = 'Benchmarks' | 'Agents' | 'Scaling' | 'Economics' | 'Methodology'

export type UpdateEvent = {
  id: string
  date: string
  category: UpdateCategory
  title: string
  summary: string
  source: string
  sourceUrl: string
  metricId?: string
  changeLabel?: string
  note?: string
}

export const updateEvents: UpdateEvent[] = [
  {
    id: 'hle-46-5',
    date: '2026-09-06',
    category: 'Benchmarks',
    title: "Humanity's Last Exam frontier reaches 46.50%",
    summary: 'The current Scale HLE leaderboard snapshot places the frontier at 46.50%, up sharply from low-single-digit results when the benchmark launched.',
    source: 'Scale AI',
    sourceUrl: 'https://labs.scale.com/leaderboard/humanitys_last_exam',
    metricId: 'hle-frontier',
    changeLabel: 'Frontier snapshot · 46.50%',
    note: 'Leaderboard values are dated snapshots and can change when new models are evaluated.',
  },
  {
    id: 'astra-arc-agi-3',
    date: '2026-09-03',
    category: 'Benchmarks',
    title: 'Astra reaches 62.7% on ARC-AGI-3 with the standard harness',
    summary: 'ARC Prize reports a 62.7% Semi-Private score for GPT-6 Astra under the standard harness, with a separate 99.9% result under the provider-adapter configuration.',
    source: 'ARC Prize',
    sourceUrl: 'https://arcprize.org/blog/astra',
    metricId: 'astra-arc-agi-3',
    changeLabel: '0.51% → 62.7% frontier comparison',
    note: 'Harness configuration materially changes the result, so both evaluations remain separate.',
  },
  {
    id: 'eci-reasoning-frontier',
    date: '2026-09-01',
    category: 'Benchmarks',
    title: 'Reasoning-model ECI frontier measured at +14 points/year',
    summary: 'Epoch reports the reasoning-era frontier advancing at about fourteen ECI points per year, compared with about six points per year for the earlier non-reasoning frontier.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/eci-frontier-trend',
    metricId: 'eci-frontier',
    changeLabel: '~6 → ~14 ECI points/year',
    note: 'This is a change in fitted frontier slope, not an individual model score.',
  },
  {
    id: 'colossus-power-record',
    date: '2026-06-15',
    category: 'Scaling',
    title: 'Observed frontier data-centre power reaches about 946 MW',
    summary: 'xAI Colossus 2 becomes the observed record-holder in Epoch’s frontier power series at roughly 946 MW of IT power.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/frontier-data-center-power',
    changeLabel: '237 MW → 946 MW since Aug 2024',
    note: 'The series uses observed facilities only; planned future sites are excluded.',
  },
  {
    id: 'epoch-trends-2026',
    date: '2026-02-05',
    category: 'Scaling',
    title: 'Epoch refreshes core AI scaling trend estimates',
    summary: 'The trend set used by The Intelligence Curve includes 3.4×/year global compute-stock growth, 5×/year frontier training compute growth and a 2.4-month context-window doubling time.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/trends',
    metricId: 'global-compute-capacity',
    changeLabel: 'Core trend-fit refresh',
  },
  {
    id: 'metr-th11',
    date: '2026-01-29',
    category: 'Agents',
    title: 'METR releases Time Horizon 1.1',
    summary: 'METR’s revised task suite estimates a post-2023 50% autonomous task-horizon doubling time of 130.8 days.',
    source: 'METR',
    sourceUrl: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/',
    metricId: 'agent-time-horizon',
    changeLabel: '130.8-day fitted doubling time',
    note: 'The estimate changed materially with the task suite, so versioning remains attached to the number.',
  },
  {
    id: 'inference-price-study',
    date: '2025-03-12',
    category: 'Economics',
    title: 'Inference price falls rapidly at fixed capability thresholds',
    summary: 'Epoch’s analysis finds a median fitted decline of roughly fifty-fold per year across the benchmark-performance thresholds studied.',
    source: 'Epoch AI',
    sourceUrl: 'https://epoch.ai/data-insights/llm-inference-price-trends',
    metricId: 'inference-price',
    changeLabel: '~50× cheaper/year median fit',
    note: 'Task-specific fitted declines vary widely, so the median is not treated as a universal price law.',
  },
  {
    id: 'swe-bench-retired',
    date: '2026-02-23',
    category: 'Methodology',
    title: 'SWE-bench Verified moves from frontier signal to retired benchmark',
    summary: 'The Intelligence Curve keeps the historical rise visible but marks SWE-bench Verified as retired after contamination and task-quality concerns made it less trustworthy as a frontier measure.',
    source: 'OpenAI',
    sourceUrl: 'https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/',
    changeLabel: 'Status changed → RETIRED',
    note: 'OpenAI published its retirement analysis on 23 February 2026.',
  },
]

export function mergeRuntimeUpdateEvents(events: UpdateEvent[]) {
  const seen = new Set(updateEvents.map((event) => event.id))
  for (const event of events) {
    if (!seen.has(event.id)) {
      updateEvents.push(event)
      seen.add(event.id)
    }
  }
  updateEvents.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}
