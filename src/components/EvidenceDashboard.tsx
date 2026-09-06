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
import { benchmarkJumps, dataCenterFrontier, evidenceSources, timeHorizonModels } from '../data/progress'

const compactNumber = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 })

export default function EvidenceDashboard() {
  return (
    <>
      <section className="section-pad block-section evidence-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THEN VS NOW</span>
            <h2>Some gaps closed frighteningly fast</h2>
          </div>
          <p>These are observed benchmark results, not extrapolations. Where evaluation harnesses differ, the distinction stays attached to the number.</p>
        </div>

        <div className="then-now-grid">
          {benchmarkJumps.map((item) => (
            <article className="then-now-card" key={item.name}>
              <div className="then-now-topline">
                <span>{item.name}</span>
                <span>+{(item.after - item.before).toFixed(item.before < 1 ? 2 : 1)} pp</span>
              </div>
              <div className="then-now-values">
                <div>
                  <span className="then-now-label">THEN</span>
                  <strong>{item.before}%</strong>
                  <small>{item.beforeLabel}</small>
                </div>
                <span className="then-now-arrow" aria-hidden="true">→</span>
                <div>
                  <span className="then-now-label">NOW</span>
                  <strong>{item.after}%</strong>
                  <small>{item.afterLabel}</small>
                </div>
              </div>
              {item.note && <p>{item.note}</p>}
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.source} ↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad block-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OBSERVED SERIES</span>
            <h2>Progress is showing up in different places</h2>
          </div>
          <p>Capability, autonomous work and infrastructure are different measurements. Keeping them side by side makes the broader acceleration easier to see without pretending they are one index.</p>
        </div>

        <div className="evidence-chart-grid">
          <article className="data-chart-card">
            <div className="data-chart-header">
              <div>
                <span className="eyebrow">BENCHMARK JUMPS</span>
                <h3>Frontier scores, before and after</h3>
              </div>
              <span className="observed-pill">Observed</span>
            </div>
            <div className="chart-wrap evidence-chart">
              <ResponsiveContainer width="100%" height={330}>
                <BarChart data={benchmarkJumps} margin={{ top: 20, right: 10, left: -14, bottom: 18 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
                  <XAxis dataKey="name" tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${Number(value)}%`, '']} />
                  <Legend />
                  <Bar dataKey="before" name="Earlier score" fill="#59616a" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="after" name="Later score" fill="#b9ff66" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="source-row">Sources: ARC Prize · Stanford AI Index 2026</div>
          </article>

          <article className="data-chart-card">
            <div className="data-chart-header">
              <div>
                <span className="eyebrow">PHYSICAL SCALE</span>
                <h3>Record AI data-centre compute</h3>
              </div>
              <span className="observed-pill">Observed</span>
            </div>
            <p className="data-chart-copy">H100-equivalent computing capacity of the observed frontier facility at each record point.</p>
            <div className="chart-wrap evidence-chart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dataCenterFrontier} margin={{ top: 18, right: 16, left: 2, bottom: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
                  <XAxis dataKey="date" tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis tickFormatter={(value) => compactNumber.format(Number(value))} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} width={54} />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toLocaleString()} H100e`, 'Compute']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.label ? `${label} · ${payload[0].payload.label}` : String(label)}
                  />
                  <Line type="monotone" dataKey="h100e" stroke="#b9ff66" strokeWidth={3} dot={{ r: 3, fill: '#b9ff66' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="source-row">
              <span>{evidenceSources.dataCenters.note}</span>
              <a href={evidenceSources.dataCenters.sourceUrl} target="_blank" rel="noreferrer">{evidenceSources.dataCenters.source} ↗</a>
            </div>
          </article>

          <article className="data-chart-card data-chart-wide">
            <div className="data-chart-header">
              <div>
                <span className="eyebrow">AUTONOMOUS WORK</span>
                <h3>50% task-completion horizon</h3>
              </div>
              <span className="method-pill">TH1.1 · log scale</span>
            </div>
            <p className="data-chart-copy">The human time required for tasks a model is estimated to complete successfully half the time. The vertical axis is logarithmic so early and late systems remain legible.</p>
            <div className="chart-wrap evidence-chart">
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={timeHorizonModels} margin={{ top: 18, right: 18, left: 8, bottom: 16 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
                  <XAxis dataKey="model" tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={58} />
                  <YAxis scale="log" domain={[1, 500]} allowDataOverflow ticks={[1, 5, 20, 60, 180, 500]} tickFormatter={(value) => `${value}m`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip formatter={(value) => [`${Number(value)} minutes`, '50% horizon']} />
                  <Line type="monotone" dataKey="minutes" stroke="#b9ff66" strokeWidth={3} dot={{ r: 4, fill: '#b9ff66' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="source-row">
              <span>{evidenceSources.timeHorizon.note}</span>
              <a href={evidenceSources.timeHorizon.sourceUrl} target="_blank" rel="noreferrer">{evidenceSources.timeHorizon.source} ↗</a>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
