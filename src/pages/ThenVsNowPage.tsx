import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import SegmentedControl from '../components/SegmentedControl'
import { comparisons, hleHistory, type ComparisonCategory, type ComparisonEvidence } from '../data/comparisons'

type CategoryFilter = 'all' | ComparisonCategory
type EvidenceFilter = 'all' | ComparisonEvidence

function evidenceLabel(evidence: ComparisonEvidence) {
  if (evidence === 'observed') return 'Observed'
  if (evidence === 'trend-fit') return 'Trend fit'
  return 'Retired benchmark'
}

export default function ThenVsNowPage() {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [evidence, setEvidence] = useState<EvidenceFilter>('all')
  const [sort, setSort] = useState<'largest' | 'smallest'>('largest')

  const visible = useMemo(() => {
    return comparisons
      .filter((item) => category === 'all' || item.category === category)
      .filter((item) => evidence === 'all' || item.evidence === evidence)
      .sort((a, b) => sort === 'largest' ? b.factor - a.factor : a.factor - b.factor)
  }, [category, evidence, sort])

  const factorData = visible.map((item) => ({
    name: item.title,
    shortName: item.id === 'data-center-compute' ? 'Data-centre compute' : item.id === 'data-center-power' ? 'Data-centre power' : item.id === 'agent-horizon' ? 'Agent horizon' : item.id === 'inference-price' ? 'Inference price' : item.id === 'eci-rate' ? 'ECI rate' : item.id === 'swe-bench-verified' ? 'SWE-bench Verified' : item.id === 'arc-agi-3' ? 'ARC-AGI-3' : 'HLE',
    factor: item.factor,
    evidence: item.evidence,
  }))

  return (
    <section className="section-pad page-section then-now-page">
      <div className="page-hero data-page-hero then-now-hero">
        <span className="eyebrow">THEN VS NOW</span>
        <h1>How much changed<br />in two years?</h1>
        <p>Not one AGI score. A collection of concrete before-and-after measurements across reasoning, agents, infrastructure, economics and coding — with retired benchmarks visibly marked instead of quietly reused.</p>
        <div className="page-meta-row">
          <span>Updated 6 Sep 2026</span>
          <span>{comparisons.length} comparisons</span>
          <span>Observed · fitted · retired</span>
        </div>
      </div>

      <div className="interactive-controls controls-panel then-now-controls">
        <SegmentedControl
          label="Category"
          value={category}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Capability', value: 'Capability' },
            { label: 'Agents', value: 'Agents' },
            { label: 'Coding', value: 'Coding' },
            { label: 'Infrastructure', value: 'Infrastructure' },
            { label: 'Economics', value: 'Economics' },
          ]}
          onChange={setCategory}
        />
        <SegmentedControl
          label="Evidence"
          value={evidence}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Observed', value: 'observed' },
            { label: 'Trend fits', value: 'trend-fit' },
            { label: 'Retired', value: 'retired' },
          ]}
          onChange={setEvidence}
        />
        <SegmentedControl
          label="Order"
          value={sort}
          options={[{ label: 'Largest change', value: 'largest' }, { label: 'Smallest change', value: 'smallest' }]}
          onChange={setSort}
        />
      </div>

      <article className="data-chart-card then-now-factor-card">
        <div className="data-chart-header">
          <div>
            <span className="eyebrow">RELATIVE CHANGE</span>
            <h3>How large was the shift?</h3>
          </div>
          <span className="method-pill">Log scale</span>
        </div>
        <p className="data-chart-copy">Each bar shows a multiplicative change. For inference price, the factor means “times cheaper”. Trend-fit and retired series remain labelled separately in the cards below.</p>
        <div className="chart-wrap evidence-chart">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={factorData} layout="vertical" margin={{ top: 10, right: 26, left: 12, bottom: 10 }}>
              <CartesianGrid horizontal={false} strokeDasharray="4 8" opacity={0.18} />
              <XAxis type="number" scale="log" domain={[1, 'auto']} tickFormatter={(value) => `${Number(value)}×`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="shortName" width={126} tick={{ fill: '#8c949d', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(Number(value) >= 10 ? 1 : 2)}×`, 'Relative change']} />
              <Bar dataKey="factor" name="Relative change" fill="#b9ff66" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="comparison-grid">
        {visible.map((item) => (
          <article className={`comparison-card evidence-${item.evidence}`} key={item.id}>
            <div className="comparison-card-top">
              <span className="eyebrow">{item.category}</span>
              <span className={`evidence-status ${item.evidence}`}>{evidenceLabel(item.evidence)}</span>
            </div>
            <h2>{item.title}</h2>
            <div className="comparison-values">
              <div>
                <span>THEN</span>
                <strong>{item.thenDisplay}</strong>
                <small>{item.thenLabel}</small>
              </div>
              <i aria-hidden="true">→</i>
              <div>
                <span>NOW</span>
                <strong>{item.nowDisplay}</strong>
                <small>{item.nowLabel}</small>
              </div>
            </div>
            <div className="comparison-factor">{item.factorLabel}</div>
            <p>{item.summary}</p>
            {item.caution && <p className="comparison-caution">{item.caution}</p>}
            <div className="comparison-sources">
              {item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}
            </div>
          </article>
        ))}
      </div>

      <section className="then-now-deep-dive">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ONE BENCHMARK, OVER TIME</span>
            <h2>Humanity’s Last Exam</h2>
          </div>
          <p>HLE is useful here because it was explicitly created to remain difficult after older academic benchmarks began saturating.</p>
        </div>
        <article className="data-chart-card hle-chart-card">
          <div className="data-chart-header">
            <div><span className="eyebrow">FRONTIER SNAPSHOTS</span><h3>3.07% → 46.50%</h3></div>
            <span className="observed-pill">Observed leaderboard results</span>
          </div>
          <div className="chart-wrap evidence-chart">
            <ResponsiveContainer width="100%" height={390}>
              <LineChart data={hleHistory} margin={{ top: 20, right: 20, left: 4, bottom: 34 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
                <XAxis dataKey="date" tick={{ fill: '#8c949d', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 50]} tickFormatter={(value) => `${value}%`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Accuracy']} labelFormatter={(label, payload) => payload?.[0]?.payload?.label ? `${label} · ${payload[0].payload.label}` : String(label)} />
                <Line type="monotone" dataKey="score" stroke="#b9ff66" strokeWidth={3} dot={{ r: 4, fill: '#b9ff66' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="source-row">
            <span>Leaderboard snapshots; model/evaluation dates are retained rather than interpolated into a continuous capability curve.</span>
            <a href="https://labs.scale.com/leaderboard/humanitys_last_exam" target="_blank" rel="noreferrer">Scale HLE leaderboard ↗</a>
          </div>
        </article>
      </section>

      <aside className="retired-benchmark-callout">
        <span className="eyebrow">WHY KEEP A RETIRED BENCHMARK?</span>
        <h2>Because benchmark failure is part of the story.</h2>
        <p>SWE-bench Verified rose dramatically, then became less trustworthy as a frontier measure. OpenAI reported contamination and task-quality problems in 2026 and stopped using it. The Intelligence Curve keeps the historical rise visible, but marks the series as retired rather than pretending every upward line remains meaningful forever.</p>
      </aside>
    </section>
  )
}
