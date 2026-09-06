import { hleHistory } from './comparisons'
import { timeHorizonModels } from './progress'

export type MetricSeriesPoint = {
  label: string
  value: number
  detail?: string
}

export type MetricDetail = {
  definition: string
  whyItMatters: string
  interpretation: string
  methodology: string
  series?: MetricSeriesPoint[]
  seriesLabel?: string
  seriesUnit?: string
  seriesScale?: 'linear' | 'log'
  rawDataNote?: string
}

export const metricDetails: Record<string, MetricDetail> = {
  'global-compute-capacity': {
    definition: 'The estimated total computing power of the global stock of AI accelerators, expressed as a historical growth rate.',
    whyItMatters: 'The stock of deployed AI chips constrains how much training and inference work the industry can run in aggregate.',
    interpretation: 'A 3.4× annual historical growth rate means total available AI-chip compute roughly doubled every 6.8 months over the fitted period.',
    methodology: 'Epoch AI fits a trend to estimates of the global stock of relevant AI accelerators. This page treats the fitted rate as historical evidence, not a forecast.',
    rawDataNote: 'The headline is a fitted trend. A point-by-point source series is not yet ingested into The Intelligence Curve.',
  },
  'training-compute': {
    definition: 'The amount of compute used in frontier language-model training runs, tracked across successive systems.',
    whyItMatters: 'Training compute is one of the clearest physical inputs associated with scaling frontier models.',
    interpretation: 'Epoch’s historical fit corresponds to roughly a 5.2-month doubling time since 2020.',
    methodology: 'The rate comes from Epoch AI’s frontier training-compute trend. It should not be interpreted as an indefinitely sustainable trajectory.',
    rawDataNote: 'The headline trend is sourced; the underlying training-run series has not yet been mirrored locally.',
  },
  'context-windows': {
    definition: 'The maximum amount of input text or tokens a frontier language model can accept in one context window.',
    whyItMatters: 'Longer context can let models inspect larger codebases, documents and task histories in a single interaction.',
    interpretation: 'A fast context-window trend is an input-capacity trend, not direct evidence that useful memory or reasoning is improving at the same rate.',
    methodology: 'Epoch AI fits the frontier context-window trend across released systems since 2023.',
    rawDataNote: 'The fitted rate is displayed here; detailed release-by-release context-window data is not yet ingested.',
  },
  'software-efficiency': {
    definition: 'The reduction in compute needed to achieve a fixed level of pre-training performance.',
    whyItMatters: 'Software and algorithmic improvements can make the same hardware produce more capability, compounding hardware progress.',
    interpretation: 'A 3× annual efficiency improvement means the compute needed for the same pre-training performance fell by roughly a factor of three per year over the fitted period.',
    methodology: 'Epoch estimates this using comparable performance targets across model families and training runs.',
    rawDataNote: 'This is a historical trend fit; no synthetic point series is generated on this page.',
  },
  'training-cost': {
    definition: 'Estimated monetary cost of frontier language-model training runs.',
    whyItMatters: 'Training cost shows how much capital is being concentrated into the frontier and how quickly economic limits are being pushed.',
    interpretation: 'The historical fit rises about 3.5× per year. Rising cost is not itself a capability metric.',
    methodology: 'Epoch estimates run costs from hardware, duration and associated inputs, then fits a historical frontier trend.',
    rawDataNote: 'The source trend is retained without inventing missing run-level price observations.',
  },
  'chip-price-performance': {
    definition: 'The amount of AI-relevant hardware performance available per dollar spent on accelerators.',
    whyItMatters: 'Better price/performance makes both training and inference cheaper at a given hardware budget.',
    interpretation: 'A roughly 49% annual improvement corresponds to a historical doubling in performance per dollar about every 1.7 years.',
    methodology: 'Epoch’s spending-weighted AI-chip series is used as the source for the fitted rate.',
    rawDataNote: 'The headline fit is source-backed; the full chip-by-chip series is not yet mirrored locally.',
  },
  'inference-price': {
    definition: 'The price required to reach a fixed level of benchmark capability at inference time.',
    whyItMatters: 'Capability matters more economically when it becomes cheap enough to use at large scale.',
    interpretation: 'Epoch found a median historical fitted decline of roughly 50× per year across the capability thresholds it studied, with very wide variation by task.',
    methodology: 'The source compares model API prices at fixed benchmark-performance thresholds. The ~50× figure is a median across fitted task-specific declines, not one universal market price curve.',
    rawDataNote: 'Because the task-specific rates vary sharply, this page deliberately avoids fabricating a single pseudo-history from the median fit.',
  },
  'agent-time-horizon': {
    definition: 'The human task duration at which a model is estimated to complete tasks successfully 50% of the time on METR’s TH1.1 evaluation.',
    whyItMatters: 'It directly targets a practical question: how long can an AI agent work before reliability breaks down?',
    interpretation: 'The headline 131 days is the fitted doubling time of the horizon after 2023. It is not a claim that agents can complete 131-day projects.',
    methodology: 'METR fits task-success probability against human task duration, then estimates the 50% completion horizon for each model and a trend across release dates.',
    seriesLabel: '50% task-completion horizon',
    seriesUnit: 'minutes',
    seriesScale: 'log',
    series: timeHorizonModels.map((point) => ({ label: point.model, value: point.minutes })),
    rawDataNote: 'These are the model-level values currently mirrored by the site from METR TH1.1.',
  },
  'eci-frontier': {
    definition: 'The rate of change of Epoch AI’s composite Epoch Capabilities Index at the frontier.',
    whyItMatters: 'A composite index can reveal broad frontier movement across multiple capability evaluations without relying on one saturated benchmark.',
    interpretation: 'Epoch reports a faster fitted frontier slope after reasoning models arrived: about 14 ECI points per year versus roughly 6 for the non-reasoning frontier.',
    methodology: 'The headline is a fitted frontier slope over the reasoning-model era, not an individual model score.',
    rawDataNote: 'The slope is source-backed; the complete underlying ECI model series is not yet ingested locally.',
  },
  'hle-frontier': {
    definition: 'Frontier accuracy on Humanity’s Last Exam, a difficult multidisciplinary benchmark designed after many older academic tests began saturating.',
    whyItMatters: 'HLE gives a clearer view of progress on questions intended to remain difficult for frontier systems.',
    interpretation: 'The current dated snapshot is 46.50%, versus low-single-digit frontier results when the benchmark was introduced.',
    methodology: 'The chart uses dated public leaderboard snapshots. It does not interpolate between evaluations or treat missing months as observations.',
    seriesLabel: "Humanity's Last Exam accuracy",
    seriesUnit: '%',
    seriesScale: 'linear',
    series: hleHistory.map((point) => ({ label: point.date, value: point.score, detail: point.label })),
    rawDataNote: 'Leaderboard snapshots change over time; the current point is explicitly dated.',
  },
  'astra-arc-agi-3': {
    definition: 'GPT-6 Astra’s score on ARC-AGI-3 Semi-Private under the standard evaluation harness.',
    whyItMatters: 'ARC-AGI-3 was built to test interactive adaptation and reasoning in novel environments rather than static recall alone.',
    interpretation: 'Astra scored 62.7% under the standard harness and 99.9% using a provider-adapter configuration. Those are intentionally kept separate.',
    methodology: 'Harness configuration materially changes the result, so the site treats each configuration as a distinct evaluation condition rather than merging them.',
    rawDataNote: 'This is a benchmark-result snapshot rather than a continuous time series.',
  },
}
