import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const velocityRows = [
  { label: 'Inference price', months: 2.1, direction: 'halving', source: 'Epoch AI', url: 'https://epoch.ai/data-insights/llm-inference-price-trends', note: 'Median fitted price decline at fixed capability, converted from ~50× cheaper/year.' },
  { label: 'Context windows', months: 2.4, direction: 'doubling', source: 'Epoch AI', url: 'https://epoch.ai/trends', note: 'Frontier LLM context-window size since 2023.' },
  { label: 'Agent task horizon', months: 4.3, direction: 'doubling', source: 'METR', url: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/', note: 'TH1.1 post-2023 50% task-completion horizon; 131 days ≈ 4.3 months.' },
  { label: 'Training compute', months: 5.2, direction: 'doubling', source: 'Epoch AI', url: 'https://epoch.ai/trends', note: 'Frontier language-model training compute since 2020.' },
  { label: 'Global compute stock', months: 6.8, direction: 'doubling', source: 'Epoch AI', url: 'https://epoch.ai/trends', note: 'Total computing power of the global AI-chip stock.' },
  { label: 'Training cost', months: 7.0, direction: 'doubling', source: 'Epoch AI', url: 'https://epoch.ai/trends', note: 'Frontier language-model training cost since 2020.' },
  { label: 'Software efficiency', months: 7.6, direction: 'doubling', source: 'Epoch AI', url: 'https://epoch.ai/trends', note: 'Improvement in pre-training compute efficiency.' },
  { label: 'Data-centre power', months: 10.0, direction: 'doubling', source: 'Epoch AI', url: 'https://epoch.ai/data-insights/frontier-data-center-power', note: 'Historical fit to observed frontier data-centre IT power records.' },
  { label: 'Chip perf / $', months: 20.4, direction: 'doubling', source: 'Epoch AI', url: 'https://epoch.ai/data-insights/chip-performance-per-dollar', note: 'Spending-weighted AI-chip performance per dollar since 2023.' },
]

export default function VelocityPage() {
  return (
    <section className="section-pad page-section velocity-page">
      <div className="page-hero data-page-hero velocity-hero">
        <span className="eyebrow">AI VELOCITY</span>
        <h1>How fast are the<br />underlying curves moving?</h1>
        <p>A single view of the current historical pace across capability-adjacent inputs, autonomy, infrastructure and economics. No composite AGI score: each dimension keeps its own unit and source.</p>
        <div className="page-meta-row"><span>Updated 6 Sep 2026</span><span>9 multiplicative trends</span><span>Lower months = faster change</span></div>
      </div>

      <article className="velocity-trend-break">
        <div><span className="eyebrow">CAPABILITY TREND BREAK</span><h2>6 → 14 ECI points/year</h2><p>Epoch reports the non-reasoning frontier advancing at about 6 ECI points per year, versus about 14 after reasoning models arrived in September 2024.</p></div>
        <div className="velocity-break-stat"><strong>2.3×</strong><span>faster fitted frontier slope</span></div>
        <a href="https://epoch.ai/data-insights/eci-frontier-trend" target="_blank" rel="noreferrer">Epoch AI source ↗</a>
      </article>

      <article className="data-chart-card velocity-chart-card">
        <div className="data-chart-header"><div><span className="eyebrow">MULTIPLICATIVE PACE</span><h3>Months for a 2× change</h3></div><span className="method-pill">Historical fits</span></div>
        <p className="data-chart-copy">For inference price the value is a halving time; every other row is a doubling time. The chart compares pace, not importance.</p>
        <div className="chart-wrap evidence-chart">
          <ResponsiveContainer width="100%" height={520}>
            <BarChart data={velocityRows} layout="vertical" margin={{ top: 8, right: 22, left: 28, bottom: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="4 8" opacity={0.18} />
              <XAxis type="number" tickFormatter={(value) => `${value}m`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={126} tick={{ fill: '#8c949d', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${Number(value)} months`, '2× change time']} />
              <Bar dataKey="months" fill="#b9ff66" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="velocity-grid">
        {velocityRows.map((row, index) => (
          <article className="velocity-card" key={row.label}>
            <div className="velocity-rank">{String(index + 1).padStart(2, '0')}</div>
            <span className="eyebrow">{row.direction === 'halving' ? 'COST DECLINE' : 'GROWTH'}</span>
            <h2>{row.label}</h2>
            <strong>{row.months} months</strong>
            <p>{row.note}</p>
            <a href={row.url} target="_blank" rel="noreferrer">{row.source} ↗</a>
          </article>
        ))}
      </div>

      <aside className="velocity-method">
        <span className="eyebrow">HOW TO READ THIS</span>
        <h2>Velocity is not acceleration — and neither is intelligence.</h2>
        <p>A short doubling time means a measured quantity has recently changed quickly. It does not prove the rate is speeding up, that the trend will continue, or that two different dimensions contribute equally to AI capability. The ECI panel is separated because its explicit 6→14 points/year trend break is evidence of a change in slope rather than a multiplicative doubling-time series.</p>
      </aside>
    </section>
  )
}
