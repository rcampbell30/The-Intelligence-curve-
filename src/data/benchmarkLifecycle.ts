export type BenchmarkLifecycle = 'frontier-relevant' | 'ageing' | 'saturated' | 'retired'
export type BenchmarkRisk = 'contaminated' | 'harness-sensitive' | 'leaderboard-dynamic' | 'version-sensitive' | 'near-human-baseline' | 'test-quality'

export type BenchmarkLifecycleEntry = {
  id: string
  name: string
  lifecycle: BenchmarkLifecycle
  summary: string
  reason: string
  currentSignal: string
  risks: BenchmarkRisk[]
  source: string
  sourceUrl: string
  metricPath?: string
}

export const benchmarkLifecycle: BenchmarkLifecycleEntry[] = [
  {
    id: 'arc-agi-3',
    name: 'ARC-AGI-3',
    lifecycle: 'frontier-relevant',
    summary: 'An active 2026 interactive reasoning benchmark with meaningful remaining headroom under the standard harness.',
    reason: 'ARC Prize is still running the 2026 ARC-AGI-3 competition. GPT-6 Astra reached 62.7% on the Semi-Private set with the standard harness, while a provider-adapter configuration reached 99.9%, so harness configuration must remain visible.',
    currentSignal: '62.7% · standard harness',
    risks: ['harness-sensitive'],
    source: 'ARC Prize',
    sourceUrl: 'https://arcprize.org/results/openai-gpt-6-astra',
    metricPath: '/metric/astra-arc-agi-3',
  },
  {
    id: 'hle',
    name: "Humanity's Last Exam",
    lifecycle: 'frontier-relevant',
    summary: 'Still difficult enough to separate frontier systems, but the leaderboard is moving quickly and the benchmark is explicitly versioned.',
    reason: 'Scale finalized HLE to 2,500 questions in April 2025 and moved the earlier version to HLE-preview. Current frontier scores remain far below 100%, but rapid gains mean historical comparisons need version and date context.',
    currentSignal: '46.50% · current frontier snapshot',
    risks: ['leaderboard-dynamic', 'version-sensitive'],
    source: 'Scale AI',
    sourceUrl: 'https://labs.scale.com/leaderboard/humanitys_last_exam',
    metricPath: '/metric/hle-frontier',
  },
  {
    id: 'osworld',
    name: 'OSWorld',
    lifecycle: 'saturated',
    summary: 'Near the human reference level, so remaining score headroom is becoming too small to treat it as a long-lived frontier separator on its own.',
    reason: 'Stanford AI Index reports OSWorld rising from roughly 12% to 66.3%, within six percentage points of human performance. It remains informative, but proximity to the human baseline reduces its useful frontier range.',
    currentSignal: '66.3% · within ~6 pp of human',
    risks: ['near-human-baseline'],
    source: 'Stanford AI Index 2026',
    sourceUrl: 'https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance',
  },
  {
    id: 'terminal-bench-2',
    name: 'Terminal-Bench 2.0',
    lifecycle: 'ageing',
    summary: 'Still useful for agentic terminal work, but a very rapid rise in scores has materially shortened its likely useful frontier lifetime.',
    reason: 'Stanford AI Index reports accuracy increasing from 20% in February 2025 to 77.3% in early 2026. That leaves useful headroom, but the speed of improvement makes version freshness increasingly important.',
    currentSignal: '77.3% · early 2026 frontier',
    risks: ['version-sensitive'],
    source: 'Stanford AI Index 2026',
    sourceUrl: 'https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance',
  },
  {
    id: 'swe-bench-verified',
    name: 'SWE-bench Verified',
    lifecycle: 'retired',
    summary: 'Kept only as historical evidence. It should not be used as a current frontier coding signal.',
    reason: 'OpenAI stopped reporting SWE-bench Verified after finding flawed tests and evidence that frontier models had seen benchmark problems or solutions during training. OpenAI recommends moving to newer evaluations instead.',
    currentSignal: 'Historical only · no longer frontier evidence',
    risks: ['contaminated', 'test-quality'],
    source: 'OpenAI',
    sourceUrl: 'https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/',
  },
]

export function lifecycleLabel(value: BenchmarkLifecycle) {
  if (value === 'frontier-relevant') return 'Frontier-relevant'
  if (value === 'ageing') return 'Ageing'
  if (value === 'saturated') return 'Saturated / near ceiling'
  return 'Retired'
}

export function riskLabel(value: BenchmarkRisk) {
  const labels: Record<BenchmarkRisk, string> = {
    contaminated: 'Contamination risk',
    'harness-sensitive': 'Harness-sensitive',
    'leaderboard-dynamic': 'Dynamic leaderboard',
    'version-sensitive': 'Version-sensitive',
    'near-human-baseline': 'Near human baseline',
    'test-quality': 'Test-quality issues',
  }
  return labels[value]
}

export function lifecycleForBenchmark(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return benchmarkLifecycle.find((item) => item.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized)
}
