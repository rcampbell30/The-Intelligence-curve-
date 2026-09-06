import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { velocityRows, type VelocityDirection } from '../data/velocity'

type SortMode = 'fastest' | 'slowest'
type DirectionFilter = 'all' | VelocityDirection

export default function VelocityPage() {
  const [sortMode, setSortMode] = useState<SortMode>('fastest')
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all')

  const rankedRows = useMemo(() => velocityRows
    .filter((row) => directionFilter === 'all' || row.direction === directionFilter)
    .sort((a, b) => sortMode === 'fastest' ? a.months - b.months : b.months - a.months), [directionFilter, sortMode])

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

      <article className="velocity-leaderboard" aria-labelledby="velocity-leaderboard-title">
        <div className="velocity-leaderboard-head">
          <div>
            <span className="eyebrow">FASTEST-CHANGING SIGNALS</span>
            <h2 id="velocity-leaderboard-title">Which curves are moving fastest?</h2>
            <p>Ranked by historical doubling or halving time. Shorter intervals mean faster measured change — not greater importance or more “intelligence”.</p>
          </div>
          <div className="velocity-leaderboard-count"><strong>{rankedRows.length}</strong><span>signals shown</span></div>
        </div>

        <div className="velocity-controls" aria-label="Velocity leaderboard controls">
          <div className="velocity-control-group">
            <span>Direction</span>
            <div className="velocity-toggle-row">
              {(['all', 'doubling', 'halving'] as DirectionFilter[]).map((value) => (
                <button
                  type="button"
                  key={value}
                  className={directionFilter === value ? 'active' : ''}
                  aria-pressed={directionFilter === value}
                  onClick={() => setDirectionFilter(value)}
                >
                  {value === 'all' ? 'All' : value === 'doubling' ? 'Doubling' : 'Halving'}
                </button>
              ))}
            </div>
          </div>
          <div className="velocity-control-group">
            <span>Rank</span>
            <div className="velocity-toggle-row">
              <button type="button" className={sortMode === 'fastest' ? 'active' : ''} aria-pressed={sortMode === 'fastest'} onClick={() => setSortMode('fastest')}>Fastest → slowest</button>
              <button type="button" className={sortMode === 'slowest' ? 'active' : ''} aria-pressed={sortMode === 'slowest'} onClick={() => setSortMode('slowest')}>Slowest → fastest</button>
            </div>
          </div>
        </div>

        <div className="velocity-ranking-list">
          {rankedRows.map((row, index) => (
            <article className="velocity-ranking-row" key={row.id}>
              <div className="velocity-ranking-number">{String(index + 1).padStart(2, '0')}</div>
              <div className="velocity-ranking-copy">
                <div className="velocity-ranking-labels">
                  <span className="velocity-direction-badge">{row.direction === 'halving' ? 'Halving' : 'Doubling'}</span>
                  <span className="velocity-evidence-badge">Historical trend fit</span>
                </div>
                <h3>{row.label}</h3>
                <p>{row.note}</p>
              </div>
              <div className="velocity-ranking-stat">
                <strong>{row.months}</strong>
                <span>months / 2×</span>
              </div>
              <div className="velocity-ranking-actions">
                <Link to={row.metricPath}>Open metric →</Link>
                <a href={row.sourceUrl} target="_blank" rel="noreferrer">{row.source} ↗</a>
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="data-chart-card velocity-chart-card">
        <div className="data-chart-header"><div><span className="eyebrow">CURRENT FILTER</span><h3>Months for a 2× change</h3></div><span className="method-pill">Historical fits</span></div>
        <p className="data-chart-copy">The chart mirrors the leaderboard controls above. For inference price the value is a halving time; every other row is a doubling time. The comparison is pace, not importance.</p>
        <div className="chart-wrap evidence-chart">
          <ResponsiveContainer width="100%" height={Math.max(260, rankedRows.length * 58)}>
            <BarChart data={rankedRows} layout="vertical" margin={{ top: 8, right: 22, left: 28, bottom: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="4 8" opacity={0.18} />
              <XAxis type="number" tickFormatter={(value) => `${value}m`} tick={{ fill: '#8c949d' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={126} tick={{ fill: '#8c949d', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${Number(value)} months`, '2× change time']} />
              <Bar dataKey="months" fill="#b9ff66" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <aside className="velocity-method">
        <span className="eyebrow">HOW TO READ THIS</span>
        <h2>Velocity is not acceleration — and neither is intelligence.</h2>
        <p>A short doubling time means a measured quantity has recently changed quickly. It does not prove the rate is speeding up, that the trend will continue, or that two different dimensions contribute equally to AI capability. The ECI panel is separated because its explicit 6→14 points/year trend break is evidence of a change in slope rather than a multiplicative doubling-time series.</p>
      </aside>
    </section>
  )
}
