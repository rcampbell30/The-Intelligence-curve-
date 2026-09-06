import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import SegmentedControl from '../components/SegmentedControl'
import {
  benchmarkLifecycle,
  lifecycleForBenchmark,
  lifecycleLabel,
  riskLabel,
  type BenchmarkLifecycle,
} from '../data/benchmarkLifecycle'
import { benchmarkJumps } from '../data/progress'

type SourceFilter = 'all' | 'arc' | 'stanford'
type ChartView = 'scores' | 'gain'
type LifecycleFilter = 'all' | BenchmarkLifecycle | 'contaminated'

function SourceLink({ href, children }: { href: string; children: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="source-link">{children} ↗</a>
}

function lifecycleClass(value: BenchmarkLifecycle) {
  return `benchmark-life-${value}`
}

export default function BenchmarksPage() {
  const [source, setSource] = useState<SourceFilter>('all')
  const [view, setView] = useState<ChartView>('scores')
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleFilter>('all')

  const filtered = benchmarkJumps.filter((item) => {
    if (source === 'all') return true
    if (source === 'arc') return item.source.includes('ARC')
    return item.source.includes('Stanford')
  })

  const gainData = filtered.map((item) => ({ ...item, gain: Number((item.after - item.before).toFixed(2)) }))

  const visibleLifecycle = useMemo(() => benchmarkLifecycle.filter((item) => {
    if (lifecycleFilter === 'all') return true
    if (lifecycleFilter === 'contaminated') return item.risks.includes('contaminated')
    return item.lifecycle === lifecycleFilter
  }), [lifecycleFilter])

  const frontierCount = benchmarkLifecycle.filter((item) => item.lifecycle === 'frontier-relevant').length
  const retiredCount = benchmarkLifecycle.filter((item) => item.lifecycle === 'retired').length

  return (
    <section className="section-pad page-section data-page benchmarks-trust-page">
      <div className="page-hero data-page-hero">
        <span className="eyebrow">MEASURED CAPABILITY</span>
        <h1>Benchmarks</h1>
        <p>Track score movement and the lifecycle of the tests themselves. A benchmark can be useful evidence today, ageing tomorrow, and misleading later if saturation, contamination or methodology changes are ignored.</p>
        <div className="page-meta-row">
          <span>Updated 6 Sep 2026</span>
          <span>{benchmarkLifecycle.length} lifecycle records</span>
          <span>No numeric trust score</span>
        </div>
      </div>

      <section className="benchmark-trust-shell" aria-labelledby="benchmark-trust-title">
        <div className="benchmark-trust-head">
          <div>
            <span className="eyebrow">BENCHMARK LIFECYCLE</span>
            <h2 id="benchmark-trust-title">Is the benchmark still telling us something useful?</h2>
            <p>Lifecycle labels describe whether a benchmark still separates frontier systems. Risk flags are separate: a benchmark can be active but harness-sensitive, or retired specifically because contamination and test quality destroyed its signal.</p>
          </div>
          <div className="benchmark-trust-stats">
            <div><strong>{frontierCount}</strong><span>frontier-relevant</span></div>
            <div><strong>{retiredCount}</strong><span>retired</span></div>
          </div>
        </div>

        <div className="benchmark-lifecycle-legend">
          <article className="benchmark-legend-frontier"><span>Frontier-relevant</span><p>Still has meaningful headroom and current discriminating value.</p></article>
          <article className="benchmark-legend-ageing"><span>Ageing</span><p>Still useful, but rapid score growth or version churn is shortening its frontier lifetime.</p></article>
          <article className="benchmark-legend-saturated"><span>Saturated / near ceiling</span><p>Little remaining headroom; score changes increasingly say less about frontier progress.</p></article>
          <article className="benchmark-legend-retired"><span>Retired</span><p>Historical evidence only; no longer used as a current frontier signal.</p></article>
        </div>

        <div className="benchmark-lifecycle-controls">
          <SegmentedControl
            label="Lifecycle lens"
            value={lifecycleFilter}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Frontier', value: 'frontier-relevant' },
              { label: 'Ageing', value: 'ageing' },
              { label: 'Saturated', value: 'saturated' },
              { label: 'Contaminated', value: 'contaminated' },
              { label: 'Retired', value: 'retired' },
            ]}
            onChange={setLifecycleFilter}
          />
        </div>

        <div className="benchmark-lifecycle-summary">
          Showing <strong>{visibleLifecycle.length}</strong> of {benchmarkLifecycle.length} benchmark lifecycle records
          {lifecycleFilter === 'contaminated' && <span> · Contamination is a risk flag, not a lifecycle stage.</span>}
        </div>

        <div className="benchmark-lifecycle-grid">
          {visibleLifecycle.map((item) => (
            <article className="benchmark-lifecycle-card" key={item.id}>
              <div className="benchmark-lifecycle-topline">
                <span className={`benchmark-lifecycle-pill ${lifecycleClass(item.lifecycle)}`}>{lifecycleLabel(item.lifecycle)}</span>
                <span className="benchmark-current-signal">{item.currentSignal}</span>
              </div>
              <h3>{item.name}</h3>
              <p className="benchmark-lifecycle-summary-copy">{item.summary}</p>
              <div className="benchmark-risk-row">
                {item.risks.map((risk) => (
                  <span className={`benchmark-risk-pill${risk === 'contaminated' ? ' benchmark-risk-contaminated' : ''}`} key={risk}>{riskLabel(risk)}</span>
                ))}
              </div>
              <div className="benchmark-lifecycle-reason">
                <span className="eyebrow">WHY THIS LABEL</span>
                <p>{item.reason}</p>
              </div>
              <div className="benchmark-lifecycle-actions">
                {item.metricPath && <Link to={item.metricPath}>Open metric →</Link>}
                <SourceLink href={item.sourceUrl}>{item.source}</SourceLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="section-heading compact-heading benchmark-score-heading">
        <div><span className="eyebrow">SCORE HISTORY</span><h2>Keep lifecycle context attached to the numbers</h2></div>
        <p>These score comparisons remain useful, but the lifecycle label tells you how much frontier-separating headroom the benchmark still has.</p>
      </div>

      <div className="interactive-controls controls-panel">
        <SegmentedControl
          label="Source"
          value={source}
          options={[{ label: 'All', value: 'all' }, { label: 'ARC Prize', value: 'arc' }, { label: 'Stanford', value: 'stanford' }]}
          onChange={setSource}
        />
        <SegmentedControl
          label="Chart view"
          value={view}
          options={[{ label: 'Scores', value: 'scores' }, { label: 'Gain', value: 'gain' }]}
          onChange={setView}
        />
      </div>

      <article className="data-chart-card data-page-card full-width-card">
        <div className="data-chart-header">
          <div><span className="eyebrow">THEN VS NOW</span><h3>{view === 'scores' ? 'Frontier benchmark scores' : 'Percentage-point improvement'}</h3></div>
          <span className="observed-pill">Observed results</span>
        </div>
        <div className="chart-wrap evidence-chart">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={view === 'scores' ? filtered : gainData} margin={{ top: 20, right: 18, left: 0, bottom: 12 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
              <XAxis dataKey="name" tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
              <YAxis domain={view === 'scores' ? [0, 100] : [0, 'auto']} tickFormatter={(value) => `${value}${view === 'scores' ? '%' : 'pp'}`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value, name) => [`${Number(value)}${view === 'scores' ? '%' : ' pp'}`, String(name)]} />
              {view === 'scores' ? (
                <>
                  <Legend />
                  <Bar dataKey="before" name="Earlier score" fill="#59616a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="after" name="Later score" fill="#b9ff66" radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <Bar dataKey="gain" name="Gain" fill="#b9ff66" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="benchmark-detail-grid">
        {filtered.map((item) => {
          const lifecycle = lifecycleForBenchmark(item.name)
          return (
            <article className="benchmark-detail-card" key={item.name}>
              <div className="benchmark-detail-top"><span>{item.name}</span><strong>+{(item.after - item.before).toFixed(item.before < 1 ? 2 : 1)} pp</strong></div>
              {lifecycle && <span className={`benchmark-inline-life ${lifecycleClass(lifecycle.lifecycle)}`}>{lifecycleLabel(lifecycle.lifecycle)}</span>}
              <div className="benchmark-score-row"><span>{item.before}%</span><i>→</i><span>{item.after}%</span></div>
              <p><b>{item.beforeLabel}</b><br />to {item.afterLabel}</p>
              {item.note && <p className="benchmark-note">{item.note}</p>}
              <SourceLink href={item.sourceUrl}>{item.source}</SourceLink>
            </article>
          )
        })}
      </div>

      <div className="method-callout benchmark-method-callout">
        <span className="eyebrow">THE RULE</span>
        <h2>A benchmark is evidence with a shelf life.</h2>
        <p>High scores can mean genuine capability progress, but they can also signal that an evaluation is losing discriminating power. Contamination, flawed tests, harness changes and version changes are tracked separately so historical gains remain visible without being mistaken for current frontier evidence.</p>
        <Link to="/methodology" className="text-link">See the evidence rules →</Link>
      </div>
    </section>
  )
}
