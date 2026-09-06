import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import MetricCard from '../components/MetricCard'
import SegmentedControl from '../components/SegmentedControl'
import { metrics } from '../data/metrics'
import {
  benchmarkJumps,
  dataCenterFrontier,
  dataCenterPower,
  evidenceSources,
  timelineMilestones,
  timeHorizonModels,
} from '../data/progress'

const compactNumber = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 })

const doublingRates = [
  { name: 'Context window', months: 2.4, group: 'Capability' },
  { name: 'Training compute', months: 5.2, group: 'Scaling' },
  { name: 'Compute stock', months: 6.8, group: 'Scaling' },
  { name: 'Training cost', months: 7.0, group: 'Economics' },
  { name: 'Software efficiency', months: 7.6, group: 'Efficiency' },
  { name: 'Chip perf / $', months: 20.4, group: 'Hardware' },
]

type EvidenceView = 'all' | 'observed' | 'fitted'
type ScaleMode = 'linear' | 'log'

type PageHeroProps = {
  eyebrow: string
  title: string
  intro: string
}

function PageHero({ eyebrow, title, intro }: PageHeroProps) {
  return (
    <div className="page-hero data-page-hero">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{intro}</p>
      <div className="page-meta-row">
        <span>Updated 6 Sep 2026</span>
        <span>Source-linked</span>
        <span>Observed ≠ fitted ≠ projected</span>
      </div>
    </div>
  )
}

function SourceLink({ href, children }: { href: string; children: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="source-link">{children} ↗</a>
}

function metricMatchesEvidence(evidence: EvidenceView, evidenceKind: 'trend-fit' | 'benchmark-result') {
  if (evidence === 'all') return true
  if (evidence === 'observed') return evidenceKind === 'benchmark-result'
  return evidenceKind === 'trend-fit'
}

export function TrendsPage() {
  const [group, setGroup] = useState<'all' | 'Scaling' | 'Economics' | 'Capability' | 'Efficiency' | 'Hardware'>('all')
  const [sort, setSort] = useState<'fastest' | 'slowest'>('fastest')
  const [evidence, setEvidence] = useState<EvidenceView>('all')

  const filteredRates = useMemo(() => {
    const rows = group === 'all' ? doublingRates : doublingRates.filter((row) => row.group === group)
    return [...rows].sort((a, b) => sort === 'fastest' ? a.months - b.months : b.months - a.months)
  }, [group, sort])

  const visibleMetrics = metrics.filter((metric) => metricMatchesEvidence(evidence, metric.evidenceKind))

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="THE BIG PICTURE"
        title="Trends"
        intro="Compare the strongest long-run signals we can measure across capability, autonomous work, compute, efficiency and cost — without compressing them into one fake precision score."
      />

      <div className="interactive-controls controls-panel">
        <SegmentedControl
          label="Category"
          value={group}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Scaling', value: 'Scaling' },
            { label: 'Economics', value: 'Economics' },
            { label: 'Capability', value: 'Capability' },
            { label: 'Efficiency', value: 'Efficiency' },
            { label: 'Hardware', value: 'Hardware' },
          ]}
          onChange={setGroup}
        />
        <SegmentedControl
          label="Order"
          value={sort}
          options={[{ label: 'Fastest first', value: 'fastest' }, { label: 'Slowest first', value: 'slowest' }]}
          onChange={setSort}
        />
      </div>

      <div className="data-page-grid two-col">
        <article className="data-chart-card data-page-card">
          <div className="data-chart-header">
            <div><span className="eyebrow">DOUBLING SPEED</span><h3>How quickly major AI inputs are changing</h3></div>
            <span className="method-pill">Lower = faster</span>
          </div>
          <p className="data-chart-copy">Historical fitted doubling times reported by Epoch AI. Filter and reorder the view above. These are not forecasts.</p>
          <div className="chart-wrap evidence-chart">
            <ResponsiveContainer width="100%" height={390}>
              <BarChart data={filteredRates} layout="vertical" margin={{ top: 8, right: 18, left: 16, bottom: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="4 8" opacity={0.18} />
                <XAxis type="number" tickFormatter={(value) => `${value}m`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={112} tick={{ fill: '#8c949d', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${Number(value)} months`, 'Doubling time']} />
                <Bar dataKey="months" name="Doubling time" fill="#b9ff66" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="source-row"><span>Epoch AI historical trend fits.</span><SourceLink href="https://epoch.ai/trends">Epoch AI trends</SourceLink></div>
        </article>

        <article className="insight-panel">
          <span className="eyebrow">READING THE CURVES</span>
          <h2>Acceleration is broad, but not one-dimensional.</h2>
          <p>Context length, compute, price/performance and autonomous work measure different things. The site keeps them separate so a fast curve in one dimension cannot masquerade as an “AGI percentage”.</p>
          <div className="insight-stat-grid">
            <div><strong>14</strong><span>ECI points / year on the reasoning frontier</span></div>
            <div><strong>130.8d</strong><span>post-2023 agent-horizon doubling time</span></div>
            <div><strong>10mo</strong><span>frontier data-centre power doubling time</span></div>
            <div><strong>1.1M</strong><span>H100e in the largest known AI data centre</span></div>
          </div>
        </article>
      </div>

      <div className="section-heading compact-heading">
        <div><span className="eyebrow">EVIDENCE LENS</span><h2>Switch between measured results and fitted trends</h2></div>
        <p>Observed benchmark results and fitted historical rates answer different questions. Use the control below to separate them.</p>
      </div>

      <div className="interactive-controls inline-controls">
        <SegmentedControl
          label="Evidence type"
          value={evidence}
          options={[
            { label: 'All evidence', value: 'all' },
            { label: 'Observed results', value: 'observed' },
            { label: 'Historical fits', value: 'fitted' },
          ]}
          onChange={setEvidence}
        />
      </div>

      <div className="metric-grid page-metrics">{visibleMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>
    </section>
  )
}

export function BenchmarksPage() {
  const [source, setSource] = useState<'all' | 'arc' | 'stanford'>('all')
  const [view, setView] = useState<'scores' | 'gain'>('scores')

  const filtered = benchmarkJumps.filter((item) => {
    if (source === 'all') return true
    if (source === 'arc') return item.source.includes('ARC')
    return item.source.includes('Stanford')
  })

  const gainData = filtered.map((item) => ({ ...item, gain: Number((item.after - item.before).toFixed(2)) }))

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="MEASURED CAPABILITY"
        title="Benchmarks"
        intro="Filter benchmark history by source and switch between absolute scores and percentage-point gains. Harness and methodology context stays attached to every result."
      />

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
        {filtered.map((item) => (
          <article className="benchmark-detail-card" key={item.name}>
            <div className="benchmark-detail-top"><span>{item.name}</span><strong>+{(item.after - item.before).toFixed(item.before < 1 ? 2 : 1)} pp</strong></div>
            <div className="benchmark-score-row"><span>{item.before}%</span><i>→</i><span>{item.after}%</span></div>
            <p><b>{item.beforeLabel}</b><br />to {item.afterLabel}</p>
            {item.note && <p className="benchmark-note">{item.note}</p>}
            <SourceLink href={item.sourceUrl}>{item.source}</SourceLink>
          </article>
        ))}
      </div>

      <div className="method-callout">
        <span className="eyebrow">BENCHMARK WARNING</span>
        <h2>Saturation is not the same thing as general intelligence.</h2>
        <p>Scores can rise because models improve, because the harness improves, or because a benchmark stops separating frontier systems. The site keeps those changes visible rather than silently joining incompatible series.</p>
        <Link to="/methodology" className="text-link">See the evidence rules →</Link>
      </div>
    </section>
  )
}

export function AgentsPage() {
  const [scale, setScale] = useState<ScaleMode>('log')
  const [window, setWindow] = useState<'all' | 'recent'>('all')
  const agentMetrics = metrics.filter((metric) => metric.category === 'Agents')
  const agentData = window === 'all' ? timeHorizonModels : timeHorizonModels.slice(-4)

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="AUTONOMOUS WORK"
        title="Agents"
        intro="Change the chart scale and focus on recent systems to inspect METR’s 50% task-completion horizon without changing the underlying evidence."
      />

      <div className="metric-grid page-metrics">{agentMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>

      <div className="interactive-controls controls-panel">
        <SegmentedControl label="Y-axis" value={scale} options={[{ label: 'Log', value: 'log' }, { label: 'Linear', value: 'linear' }]} onChange={setScale} />
        <SegmentedControl label="Models" value={window} options={[{ label: 'All', value: 'all' }, { label: 'Recent 4', value: 'recent' }]} onChange={setWindow} />
      </div>

      <article className="data-chart-card data-page-card full-width-card">
        <div className="data-chart-header">
          <div><span className="eyebrow">TH1.1</span><h3>50% task-completion horizon</h3></div>
          <span className="method-pill">{scale === 'log' ? 'Log scale' : 'Linear scale'}</span>
        </div>
        <p className="data-chart-copy">Human expert time for tasks at the model’s estimated 50% success threshold. Switching scales changes only the view.</p>
        <div className="chart-wrap evidence-chart">
          <ResponsiveContainer width="100%" height={410}>
            <LineChart data={agentData} margin={{ top: 20, right: 20, left: 14, bottom: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
              <XAxis dataKey="model" tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} interval={0} angle={-10} textAnchor="end" height={62} />
              <YAxis
                scale={scale === 'log' ? 'log' : 'auto'}
                domain={scale === 'log' ? [1, 500] : [0, 500]}
                allowDataOverflow={scale === 'log'}
                ticks={scale === 'log' ? [1, 5, 20, 60, 180, 500] : undefined}
                tickFormatter={(value) => `${value}m`}
                tick={{ fill: '#8c949d' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip formatter={(value) => [`${Number(value)} minutes`, '50% horizon']} />
              <Line type="monotone" dataKey="minutes" stroke="#b9ff66" strokeWidth={3} dot={{ r: 4, fill: '#b9ff66' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="source-row"><span>{evidenceSources.timeHorizon.note}</span><SourceLink href={evidenceSources.timeHorizon.sourceUrl}>{evidenceSources.timeHorizon.source}</SourceLink></div>
      </article>

      <div className="concept-grid">
        <article><span className="eyebrow">P50</span><h3>50% reliability</h3><p>A model’s horizon is the human task duration where it is predicted to succeed half the time. It is not the longest task it has ever completed.</p></article>
        <article><span className="eyebrow">TREND</span><h3>130.8-day doubling</h3><p>METR’s TH1.1 fit for models released since 2023. The confidence interval is wide, and the estimate changed materially when the task suite changed.</p></article>
        <article><span className="eyebrow">REAL WORLD</span><h3>Longer ≠ fully autonomous</h3><p>Open-ended projects involve changing requirements, external systems, coordination and consequences. Time-horizon results are evidence, not a claim that every job of that length is automated.</p></article>
      </div>
    </section>
  )
}

export function ScalingPage() {
  const [measure, setMeasure] = useState<'compute' | 'power'>('compute')
  const [scale, setScale] = useState<ScaleMode>('linear')
  const [window, setWindow] = useState<'all' | '2025' | '2026'>('all')
  const scalingMetrics = metrics.filter((metric) => metric.category === 'Scaling')

  const rawData = measure === 'compute'
    ? dataCenterFrontier.map((row) => ({ date: row.date, value: row.h100e, label: row.label }))
    : dataCenterPower.map((row) => ({ date: row.date, value: row.mw, label: row.label }))

  const data = rawData.filter((row) => window === 'all' || row.date.includes(window))
  const unit = measure === 'compute' ? 'H100e' : 'MW'

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="COMPUTE & INFRASTRUCTURE"
        title="Scaling"
        intro="Switch between compute capacity and power, change the chart scale, and isolate a year without mixing planned facilities into the observed record series."
      />

      <div className="metric-grid page-metrics">{scalingMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>

      <div className="interactive-controls controls-panel">
        <SegmentedControl label="Measure" value={measure} options={[{ label: 'Compute', value: 'compute' }, { label: 'Power', value: 'power' }]} onChange={setMeasure} />
        <SegmentedControl label="Scale" value={scale} options={[{ label: 'Linear', value: 'linear' }, { label: 'Log', value: 'log' }]} onChange={setScale} />
        <SegmentedControl label="Period" value={window} options={[{ label: 'All', value: 'all' }, { label: '2025', value: '2025' }, { label: '2026', value: '2026' }]} onChange={setWindow} />
      </div>

      <article className="data-chart-card data-page-card full-width-card">
        <div className="data-chart-header">
          <div><span className="eyebrow">OBSERVED FRONTIER</span><h3>{measure === 'compute' ? 'Largest known AI data-centre compute' : 'Frontier data-centre IT power'}</h3></div>
          <span className="observed-pill">Observed</span>
        </div>
        <p className="data-chart-copy">{measure === 'compute' ? evidenceSources.dataCenters.note : evidenceSources.dataCenterPower.note}</p>
        <div className="chart-wrap evidence-chart">
          <ResponsiveContainer width="100%" height={390}>
            <LineChart data={data} margin={{ top: 18, right: 18, left: 6, bottom: 12 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
              <XAxis dataKey="date" tick={{ fill: '#8c949d', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                scale={scale === 'log' ? 'log' : 'auto'}
                domain={scale === 'log' ? [1, 'auto'] : [0, 'auto']}
                allowDataOverflow={scale === 'log'}
                tickFormatter={(value) => measure === 'compute' ? compactNumber.format(Number(value)) : `${value}MW`}
                tick={{ fill: '#8c949d' }}
                axisLine={false}
                tickLine={false}
                width={68}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toLocaleString()} ${unit}`, measure === 'compute' ? 'Compute' : 'IT power']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.label ? `${label} · ${payload[0].payload.label}` : String(label)}
              />
              <Line type="monotone" dataKey="value" stroke="#b9ff66" strokeWidth={3} dot={{ r: 4, fill: '#b9ff66' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="source-row">
          <span>{data.length} observed record point{data.length === 1 ? '' : 's'} shown.</span>
          <SourceLink href={measure === 'compute' ? evidenceSources.dataCenters.sourceUrl : evidenceSources.dataCenterPower.sourceUrl}>
            {measure === 'compute' ? evidenceSources.dataCenters.source : evidenceSources.dataCenterPower.source}
          </SourceLink>
        </div>
      </article>

      <div className="scaling-callout">
        <div><span className="eyebrow">GLOBAL STOCK</span><strong>3.4× / yr</strong><p>Epoch’s fitted historical growth rate for total global AI compute stock since 2022.</p></div>
        <div><span className="eyebrow">TRAINING</span><strong>5× / yr</strong><p>Frontier language-model training compute growth in Epoch’s historical fit.</p></div>
        <div><span className="eyebrow">POWER</span><strong>~10 mo</strong><p>Estimated doubling time for the observed frontier data-centre power record series.</p></div>
      </div>
    </section>
  )
}

export function TimelinePage() {
  const [category, setCategory] = useState<'all' | 'Scaling' | 'Capability' | 'Agents' | 'Benchmarks'>('all')
  const [source, setSource] = useState<'all' | 'Epoch AI' | 'METR' | 'ARC Prize'>('all')

  const visible = timelineMilestones.filter((item) => {
    const categoryMatch = category === 'all' || item.category === category
    const sourceMatch = source === 'all' || item.source.includes(source)
    return categoryMatch && sourceMatch
  })

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="THEN VS NOW"
        title="Timeline"
        intro="Filter the chronology by capability, agents, scaling or source. Each milestone remains linked to the evidence it came from."
      />

      <div className="interactive-controls controls-panel">
        <SegmentedControl
          label="Category"
          value={category}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Scaling', value: 'Scaling' },
            { label: 'Capability', value: 'Capability' },
            { label: 'Agents', value: 'Agents' },
            { label: 'Benchmarks', value: 'Benchmarks' },
          ]}
          onChange={setCategory}
        />
        <SegmentedControl
          label="Source"
          value={source}
          options={[{ label: 'All', value: 'all' }, { label: 'Epoch', value: 'Epoch AI' }, { label: 'METR', value: 'METR' }, { label: 'ARC', value: 'ARC Prize' }]}
          onChange={setSource}
        />
      </div>

      <div className="filter-summary">Showing <strong>{visible.length}</strong> of {timelineMilestones.length} milestones</div>

      <div className="timeline-list">
        {visible.map((item, index) => (
          <article className="timeline-row" key={`${item.date}-${item.title}`}>
            <span className="timeline-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="timeline-date">{item.date}</span>
            <div className="timeline-content">
              <span className="eyebrow">{item.category}</span>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
              <SourceLink href={item.sourceUrl}>{item.source}</SourceLink>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function MethodologyPage() {
  const [evidence, setEvidence] = useState<EvidenceView>('all')
  const visibleMetrics = metrics.filter((metric) => metricMatchesEvidence(evidence, metric.evidenceKind))

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="TRUST THE GRAPH"
        title="Methodology"
        intro="The Intelligence Curve treats observed results, historical fits and future extrapolations as different evidence classes. The distinction is structural, not a footnote."
      />

      <div className="evidence-class-grid">
        <article className="evidence-class observed-class"><span>01</span><h2>Observed</h2><p>A measured benchmark result, released model evaluation or recorded infrastructure datapoint. The source, date and evaluation context stay attached.</p></article>
        <article className="evidence-class fitted-class"><span>02</span><h2>Trend fit</h2><p>A statistical description of historical change, such as a doubling time. It describes the fitted period and does not automatically continue into the future.</p></article>
        <article className="evidence-class projected-class"><span>03</span><h2>Extrapolation</h2><p>A deliberately hypothetical extension of a rate. Projection controls are visually separated and labelled so they cannot be mistaken for observed evidence.</p></article>
      </div>

      <div className="section-heading compact-heading">
        <div><span className="eyebrow">INSPECT THE DATASET</span><h2>Filter the headline indicators by evidence class</h2></div>
        <p>This is the same evidence distinction used elsewhere on the site.</p>
      </div>

      <div className="interactive-controls inline-controls">
        <SegmentedControl
          label="Evidence type"
          value={evidence}
          options={[{ label: 'All', value: 'all' }, { label: 'Observed', value: 'observed' }, { label: 'Trend fits', value: 'fitted' }]}
          onChange={setEvidence}
        />
      </div>
      <div className="metric-grid page-metrics">{visibleMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>

      <div className="methodology-grid">
        <article><span className="eyebrow">SOURCES</span><h3>Prefer original evaluators and specialist datasets.</h3><p>Primary benchmark organisations, original model reports and dedicated measurement groups take priority over screenshots, social posts or secondary summaries.</p></article>
        <article><span className="eyebrow">UNCERTAINTY</span><h3>Keep caveats attached to the number.</h3><p>Confidence intervals, harness differences, fitted periods and methodology changes should remain visible whenever they materially change interpretation.</p></article>
        <article><span className="eyebrow">VERSIONING</span><h3>Do not silently join incompatible series.</h3><p>If a benchmark, agent harness or methodology changes, the old and new versions remain distinguishable rather than being blended into a false continuous curve.</p></article>
        <article><span className="eyebrow">PREDICTIONS</span><h3>Extrapolation is opt-in.</h3><p>The interactive lab lets readers explore exponential maths, but its outputs are never presented as forecasts or as measured progress toward AGI.</p></article>
      </div>

      <div className="method-callout">
        <span className="eyebrow">DESIGN PRINCIPLE</span>
        <h2>If a control changes the evidence, it should say so.</h2>
        <p>Scale and filter controls only change what the reader sees. Projection controls are the exception: they generate hypothetical values and are therefore isolated in the Extrapolation Lab.</p>
        <Link to="/" className="text-link">Open the extrapolation lab →</Link>
      </div>
    </section>
  )
}
