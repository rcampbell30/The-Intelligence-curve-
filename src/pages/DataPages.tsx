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
  { name: 'Context window', months: 2.4, group: 'Model capability' },
  { name: 'Training compute', months: 5.2, group: 'Scaling' },
  { name: 'Compute stock', months: 6.8, group: 'Scaling' },
  { name: 'Training cost', months: 7.0, group: 'Economics' },
  { name: 'Software efficiency', months: 7.6, group: 'Efficiency' },
  { name: 'Chip perf / $', months: 20.4, group: 'Hardware' },
]

function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
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

export function TrendsPage() {
  const capabilityMetrics = metrics.filter((metric) => metric.category === 'Benchmarks' || metric.category === 'Agents')

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="THE BIG PICTURE"
        title="Trends"
        intro="The strongest long-run signals we can measure across model capability, autonomous work, compute, efficiency and cost — without compressing them into one fake precision score."
      />

      <div className="data-page-grid two-col">
        <article className="data-chart-card data-page-card">
          <div className="data-chart-header">
            <div><span className="eyebrow">DOUBLING SPEED</span><h3>How quickly major AI inputs are changing</h3></div>
            <span className="method-pill">Lower = faster</span>
          </div>
          <p className="data-chart-copy">Historical fitted doubling times reported by Epoch AI. These are not forecasts.</p>
          <div className="chart-wrap evidence-chart">
            <ResponsiveContainer width="100%" height={390}>
              <BarChart data={doublingRates} layout="vertical" margin={{ top: 8, right: 18, left: 16, bottom: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="4 8" opacity={0.18} />
                <XAxis type="number" tickFormatter={(value) => `${value}m`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={112} tick={{ fill: '#8c949d', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${Number(value)} months`, 'Doubling time']} />
                <Bar dataKey="months" name="Doubling time" fill="#b9ff66" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="source-row"><span>Epoch AI trend fits, updated 5 Feb 2026.</span><SourceLink href="https://epoch.ai/trends">Epoch AI trends</SourceLink></div>
        </article>

        <article className="insight-panel">
          <span className="eyebrow">READING THE CURVES</span>
          <h2>Acceleration is broad, but not one-dimensional.</h2>
          <p>Context length can expand rapidly without equivalent gains in reasoning. Training spend can rise while software efficiency simultaneously improves. Agent horizons measure something different again: reliable completion of longer tasks.</p>
          <div className="insight-stat-grid">
            <div><strong>14</strong><span>ECI points / year on the reasoning frontier</span></div>
            <div><strong>130.8d</strong><span>post-2023 agent-horizon doubling time</span></div>
            <div><strong>10mo</strong><span>frontier data-centre power doubling time</span></div>
            <div><strong>1.1M</strong><span>H100e in the largest known AI data centre</span></div>
          </div>
        </article>
      </div>

      <div className="section-heading compact-heading">
        <div><span className="eyebrow">CAPABILITY SIGNALS</span><h2>What the curves do — and don’t — imply</h2></div>
        <p>Every card preserves its evidence type and caveat. A fitted rate is evidence about recent history, not a promise about 2030.</p>
      </div>
      <div className="metric-grid page-metrics">{capabilityMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>
    </section>
  )
}

export function BenchmarksPage() {
  const benchmarkMetrics = metrics.filter((metric) => metric.category === 'Benchmarks')

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="MEASURED CAPABILITY"
        title="Benchmarks"
        intro="Benchmark history matters more than isolated leaderboard screenshots. This page keeps the earlier result, later result, evaluation context and source together."
      />

      <div className="metric-grid page-metrics">{benchmarkMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>

      <article className="data-chart-card data-page-card full-width-card">
        <div className="data-chart-header">
          <div><span className="eyebrow">THEN VS NOW</span><h3>Frontier benchmark score jumps</h3></div>
          <span className="observed-pill">Observed results</span>
        </div>
        <div className="chart-wrap evidence-chart">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={benchmarkJumps} margin={{ top: 20, right: 18, left: 0, bottom: 12 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
              <XAxis dataKey="name" tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${Number(value)}%`, '']} />
              <Legend />
              <Bar dataKey="before" name="Earlier score" fill="#59616a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" name="Later score" fill="#b9ff66" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="benchmark-detail-grid">
        {benchmarkJumps.map((item) => (
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
  const agentMetrics = metrics.filter((metric) => metric.category === 'Agents')

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="AUTONOMOUS WORK"
        title="Agents"
        intro="The important question is shifting from ‘can a model solve this?’ to ‘how long can it work before a human has to rescue it?’ METR’s task horizon is one attempt to measure that directly."
      />

      <div className="metric-grid page-metrics">{agentMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>

      <article className="data-chart-card data-page-card full-width-card">
        <div className="data-chart-header">
          <div><span className="eyebrow">TH1.1</span><h3>50% task-completion horizon</h3></div>
          <span className="method-pill">Log scale</span>
        </div>
        <p className="data-chart-copy">Human expert time for tasks at the model’s estimated 50% success threshold. The y-axis is logarithmic; this keeps the early models visible.</p>
        <div className="chart-wrap evidence-chart">
          <ResponsiveContainer width="100%" height={410}>
            <LineChart data={timeHorizonModels} margin={{ top: 20, right: 20, left: 14, bottom: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
              <XAxis dataKey="model" tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} interval={0} angle={-10} textAnchor="end" height={62} />
              <YAxis scale="log" domain={[1, 500]} allowDataOverflow ticks={[1, 5, 20, 60, 180, 500]} tickFormatter={(value) => `${value}m`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} width={52} />
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
  const scalingMetrics = metrics.filter((metric) => metric.category === 'Scaling')

  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="COMPUTE & INFRASTRUCTURE"
        title="Scaling"
        intro="AI progress has a physical substrate: chips, training runs, data centres and electricity. These curves show how quickly that substrate is expanding."
      />

      <div className="metric-grid page-metrics">{scalingMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>

      <div className="data-page-grid two-col">
        <article className="data-chart-card data-page-card">
          <div className="data-chart-header"><div><span className="eyebrow">COMPUTE CAPACITY</span><h3>Largest known AI data centre</h3></div><span className="observed-pill">Observed</span></div>
          <p className="data-chart-copy">H100-equivalent capacity at successive observed frontier records. Planned facilities are excluded.</p>
          <div className="chart-wrap evidence-chart">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={dataCenterFrontier} margin={{ top: 18, right: 16, left: 4, bottom: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
                <XAxis dataKey="date" tick={{ fill: '#8c949d', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis tickFormatter={(value) => compactNumber.format(Number(value))} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} width={58} />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} H100e`, 'Compute']} labelFormatter={(label, payload) => payload?.[0]?.payload?.label ? `${label} · ${payload[0].payload.label}` : String(label)} />
                <Line type="monotone" dataKey="h100e" stroke="#b9ff66" strokeWidth={3} dot={{ r: 3, fill: '#b9ff66' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="source-row"><span>{evidenceSources.dataCenters.note}</span><SourceLink href={evidenceSources.dataCenters.sourceUrl}>{evidenceSources.dataCenters.source}</SourceLink></div>
        </article>

        <article className="data-chart-card data-page-card">
          <div className="data-chart-header"><div><span className="eyebrow">POWER</span><h3>Frontier data-centre IT power</h3></div><span className="method-pill">~10mo doubling</span></div>
          <p className="data-chart-copy">Observed record events only. The current observed power record in Epoch’s series is about 946 MW.</p>
          <div className="chart-wrap evidence-chart">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={dataCenterPower} margin={{ top: 18, right: 16, left: 4, bottom: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
                <XAxis dataKey="date" tick={{ fill: '#8c949d', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `${value}MW`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} width={66} />
                <Tooltip formatter={(value) => [`${Number(value)} MW`, 'IT power']} labelFormatter={(label, payload) => payload?.[0]?.payload?.label ? `${label} · ${payload[0].payload.label}` : String(label)} />
                <Line type="monotone" dataKey="mw" stroke="#d9b86a" strokeWidth={3} dot={{ r: 3, fill: '#d9b86a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="source-row"><span>{evidenceSources.dataCenterPower.note}</span><SourceLink href={evidenceSources.dataCenterPower.sourceUrl}>{evidenceSources.dataCenterPower.source}</SourceLink></div>
        </article>
      </div>

      <div className="scaling-callout">
        <div><span className="eyebrow">CURRENT SCALE</span><strong>1.1M H100e</strong><p>Largest known AI data-centre computing capacity reported by Epoch AI.</p></div>
        <div><span className="eyebrow">CURRENT POWER RECORD</span><strong>~946 MW</strong><p>Observed record-holder in Epoch’s frontier power series.</p></div>
        <div><span className="eyebrow">CONTEXT</span><strong>Different records</strong><p>The centre with the most compute need not be the one drawing the most power because chip efficiency differs.</p></div>
      </div>
    </section>
  )
}

export function TimelinePage() {
  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="THEN VS NOW"
        title="Timeline"
        intro="A compact chronology connecting capability, autonomous work and physical scaling. The aim is to make the speed of change visible without turning release hype into evidence."
      />

      <div className="timeline-list">
        {timelineMilestones.map((item, index) => (
          <article className="timeline-row" key={`${item.date}-${item.title}`}>
            <div className="timeline-index">{String(index + 1).padStart(2, '0')}</div>
            <div className="timeline-date">{item.date}</div>
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
  return (
    <section className="section-pad page-section data-page">
      <PageHero
        eyebrow="TRUST THE GRAPH"
        title="Methodology"
        intro="The site separates what happened, what a statistical fit says about recent history, and what happens if you mechanically extend that fit. Those are three different claims."
      />

      <div className="evidence-class-grid">
        <article className="evidence-class observed-class"><span>01</span><h2>Observed</h2><p>A recorded benchmark score, model result or infrastructure datapoint. Observations retain their date, model/facility, evaluation context and source.</p></article>
        <article className="evidence-class fitted-class"><span>02</span><h2>Trend fit</h2><p>A rate estimated across historical observations — such as a doubling time. It describes the fitted period and does not imply the rate will continue.</p></article>
        <article className="evidence-class projected-class"><span>03</span><h2>Extrapolation</h2><p>A mathematical extension beyond observed data. Extrapolations are opt-in, visually distinct and explicitly labelled as non-forecasts.</p></article>
      </div>

      <div className="methodology-grid">
        <article><span className="eyebrow">SOURCE STANDARD</span><h3>Prefer primary or specialist measurement sources</h3><p>ARC Prize for ARC evaluations, METR for time horizons, Epoch AI for scaling trends and high-quality benchmark aggregators where primary evaluation data is impractical.</p></article>
        <article><span className="eyebrow">VERSIONING</span><h3>Method changes create new series</h3><p>If a benchmark, harness or task suite changes materially, the site should preserve the old version rather than silently splicing the numbers together.</p></article>
        <article><span className="eyebrow">UNCERTAINTY</span><h3>Headline numbers never erase caveats</h3><p>Confidence intervals and methodological limits should be linked or shown whenever the source reports them. Concision is not permission to imply false certainty.</p></article>
        <article><span className="eyebrow">NO AGI SCORE</span><h3>Different measurements stay different</h3><p>Compute, benchmarks, agent horizons and prices are not added into a single arbitrary percentage. Users should be able to see the underlying evidence themselves.</p></article>
      </div>

      <div className="method-callout">
        <span className="eyebrow">SITE RULE</span>
        <h2>If a dramatic claim cannot survive a source link and a caveat, it does not belong on the chart.</h2>
        <p>That rule matters more as the underlying numbers become more extraordinary.</p>
      </div>
    </section>
  )
}
