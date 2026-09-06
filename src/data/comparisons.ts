export type ComparisonCategory = 'Capability' | 'Agents' | 'Coding' | 'Infrastructure' | 'Economics'
export type ComparisonEvidence = 'observed' | 'trend-fit' | 'retired'

export type Comparison = {
  id: string
  category: ComparisonCategory
  title: string
  thenDisplay: string
  nowDisplay: string
  thenLabel: string
  nowLabel: string
  factor: number
  factorLabel: string
  evidence: ComparisonEvidence
  summary: string
  caution?: string
  sources: { label: string; url: string }[]
}

export const comparisons: Comparison[] = [
  {
    id: 'arc-agi-3',
    category: 'Capability',
    title: 'ARC-AGI-3 frontier score',
    thenDisplay: '0.51%',
    nowDisplay: '62.7%',
    thenLabel: 'Frontier AI · Mar 2026',
    nowLabel: 'Astra standard harness · Sep 2026',
    factor: 122.94,
    factorLabel: '123× the score',
    evidence: 'observed',
    summary: 'A deliberately difficult interactive reasoning benchmark went from almost unsolved by frontier systems to a majority score within roughly six months.',
    caution: 'Astra also reached 99.9% with a provider-adapter harness. The site keeps that result separate because harness configuration materially changes the score.',
    sources: [{ label: 'ARC Prize', url: 'https://arcprize.org/blog/astra' }],
  },
  {
    id: 'hle',
    category: 'Capability',
    title: "Humanity's Last Exam",
    thenDisplay: '3.07%',
    nowDisplay: '46.50%',
    thenLabel: 'GPT-4o · Nov 2024',
    nowLabel: 'Current leader · Sep 2026',
    factor: 15.15,
    factorLabel: '15.1× the score',
    evidence: 'observed',
    summary: 'A benchmark built because many older academic tests were saturating has itself seen a large jump in frontier accuracy.',
    caution: 'The current leaderboard evolves as new models are evaluated; the score shown here is a dated snapshot, not a permanent record.',
    sources: [
      { label: 'Scale HLE launch', url: 'https://scale.com/blog/humanitys-last-exam-results' },
      { label: 'Scale HLE leaderboard', url: 'https://labs.scale.com/leaderboard/humanitys_last_exam' },
    ],
  },
  {
    id: 'agent-horizon',
    category: 'Agents',
    title: '50% autonomous task horizon',
    thenDisplay: '3.5 min',
    nowDisplay: '320 min',
    thenLabel: 'GPT-4 0314',
    nowLabel: 'Claude Opus 4.5',
    factor: 91.43,
    factorLabel: '91× longer tasks',
    evidence: 'observed',
    summary: 'On METR’s TH1.1 task suite, the human task duration at which frontier agents reach an estimated 50% success rate has expanded dramatically.',
    caution: 'This does not mean agents can autonomously complete arbitrary five-hour jobs. It is a benchmark-specific estimate over a defined task distribution.',
    sources: [{ label: 'METR TH1.1', url: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/' }],
  },
  {
    id: 'data-center-compute',
    category: 'Infrastructure',
    title: 'Largest observed AI data-centre compute',
    thenDisplay: '80k H100e',
    nowDisplay: '1.1M H100e',
    thenLabel: 'Aug 2024',
    nowLabel: 'Sep 2026',
    factor: 13.75,
    factorLabel: '13.8× more compute',
    evidence: 'observed',
    summary: 'The observed record for compute inside a single AI data centre rose by more than an order of magnitude in roughly two years.',
    caution: 'This series uses observed facilities only; announced or planned future capacity is excluded.',
    sources: [{ label: 'Epoch AI', url: 'https://epoch.ai/trends' }],
  },
  {
    id: 'data-center-power',
    category: 'Infrastructure',
    title: 'Frontier data-centre IT power',
    thenDisplay: '237 MW',
    nowDisplay: '946 MW',
    thenLabel: 'Aug 2024',
    nowLabel: 'Jun 2026',
    factor: 3.99,
    factorLabel: '4.0× the power',
    evidence: 'observed',
    summary: 'The power capacity associated with the observed frontier AI data-centre record roughly quadrupled in under two years.',
    caution: 'Epoch estimates the record series itself has doubled about every ten months since mid-2024.',
    sources: [{ label: 'Epoch AI', url: 'https://epoch.ai/data-insights/frontier-data-center-power' }],
  },
  {
    id: 'eci-rate',
    category: 'Capability',
    title: 'Epoch Capabilities Index frontier rate',
    thenDisplay: '+6 / yr',
    nowDisplay: '+14 / yr',
    thenLabel: 'Non-reasoning frontier',
    nowLabel: 'Reasoning frontier',
    factor: 2.33,
    factorLabel: '2.3× faster frontier trend',
    evidence: 'trend-fit',
    summary: 'Epoch finds a substantial trend break in its composite capabilities index after reasoning models arrived in September 2024.',
    caution: 'These are fitted slopes over two model eras, not two individual benchmark observations.',
    sources: [{ label: 'Epoch AI', url: 'https://epoch.ai/data-insights/eci-frontier-trend' }],
  },
  {
    id: 'inference-price',
    category: 'Economics',
    title: 'Price to reach a fixed capability level',
    thenDisplay: '1× cost',
    nowDisplay: '~0.02× cost',
    thenLabel: 'Illustrative one-year baseline',
    nowLabel: 'Median historical price trend',
    factor: 50,
    factorLabel: '~50× cheaper / year',
    evidence: 'trend-fit',
    summary: 'Across the performance thresholds Epoch studied, the median fitted decline in inference price was about fifty-fold per year.',
    caution: 'The task-specific range was extremely wide: roughly 9× to 900× per year. This is a historical fit, not a forecast or a universal price curve.',
    sources: [{ label: 'Epoch AI', url: 'https://epoch.ai/data-insights/llm-inference-price-trends' }],
  },
  {
    id: 'swe-bench-verified',
    category: 'Coding',
    title: 'SWE-bench Verified — legacy series',
    thenDisplay: '33.2%',
    nowDisplay: '79.2%',
    thenLabel: 'GPT-4o · Aug 2024',
    nowLabel: 'Leaderboard peak · Dec 2025',
    factor: 2.39,
    factorLabel: '2.4× the resolved rate',
    evidence: 'retired',
    summary: 'The historical leaderboard shows a major rise in coding-agent success, but this benchmark is now more useful as a case study in benchmark lifecycle than as a frontier measure.',
    caution: 'OpenAI stopped reporting SWE-bench Verified in 2026 after finding contamination and task-quality problems. It is intentionally marked RETIRED here rather than presented as current frontier evidence.',
    sources: [
      { label: 'OpenAI 2024 baseline', url: 'https://openai.com/index/introducing-swe-bench-verified/' },
      { label: 'SWE-bench leaderboard', url: 'https://www.swebench.com/' },
      { label: 'OpenAI retirement note', url: 'https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/' },
    ],
  },
]

export const hleHistory = [
  { label: 'GPT-4o', date: 'Nov 2024', score: 3.07 },
  { label: 'o1', date: 'Dec 2024', score: 8.0 },
  { label: 'Gemini 2.5 Pro', date: 'Mar 2025', score: 18.81 },
  { label: 'o3', date: 'Apr 2025', score: 20.3 },
  { label: 'GPT-5', date: 'Aug 2025', score: 25.32 },
  { label: 'GPT-5 Pro', date: 'Oct 2025', score: 31.64 },
  { label: 'GPT-5.4 Pro', date: 'Mar 2026', score: 44.32 },
  { label: 'Current leader', date: 'Sep 2026', score: 46.5 },
]
