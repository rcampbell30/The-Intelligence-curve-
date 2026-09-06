import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FreshnessBadge from '../components/FreshnessBadge'
import MonitorStatusPanel from '../components/MonitorStatusPanel'
import SegmentedControl from '../components/SegmentedControl'
import { formatFreshnessDate, freshnessByMetric, getFreshness } from '../data/freshness'
import { metrics } from '../data/metrics'
import { updateEvents, type UpdateCategory } from '../data/updates'

type CategoryFilter = 'all' | UpdateCategory

type SourceFilter = 'all' | 'Epoch AI' | 'METR' | 'ARC Prize' | 'Scale AI' | 'OpenAI'

function formatEventDate(date: string, eventId: string) {
  if (eventId === 'swe-bench-retired') return '2026'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

export default function UpdatesPage() {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [source, setSource] = useState<SourceFilter>('all')

  const visible = useMemo(() => updateEvents
    .filter((event) => {
      const categoryMatch = category === 'all' || event.category === category
      const sourceMatch = source === 'all' || event.source === source
      return categoryMatch && sourceMatch
    })
    .sort((a, b) => b.date.localeCompare(a.date)), [category, source])

  const freshnessRows = metrics.map((metric) => ({ metric, freshness: getFreshness(metric.id) })).filter((row) => row.freshness)
  const currentCount = freshnessRows.filter((row) => row.freshness?.status === 'current').length
  const dueCount = freshnessRows.filter((row) => row.freshness?.status === 'due').length
  const staleCount = freshnessRows.filter((row) => row.freshness?.status === 'stale').length
  const latestVerification = Object.values(freshnessByMetric).map((item) => item.lastVerified).sort().at(-1) ?? '2026-09-06'

  return (
    <section className="section-pad page-section updates-page">
      <div className="page-hero data-page-hero updates-hero">
        <span className="eyebrow">WHAT CHANGED?</span>
        <h1>The AI progress<br />update feed.</h1>
        <p>A source-linked record of benchmark jumps, new trend fits, infrastructure records and methodology changes — plus a visible freshness audit for every headline metric on the site.</p>
        <div className="page-meta-row">
          <span>Verification sweep · {formatFreshnessDate(latestVerification)}</span>
          <span>{metrics.length} monitored metrics</span>
          <span>{updateEvents.length} recorded changes</span>
        </div>
      </div>

      <div className="freshness-summary-grid">
        <article className="freshness-summary current"><span className="eyebrow">CURRENT</span><strong>{currentCount}</strong><p>Metrics still inside their source-review cadence.</p></article>
        <article className="freshness-summary due"><span className="eyebrow">REVIEW DUE</span><strong>{dueCount}</strong><p>Metrics that have reached their next verification date.</p></article>
        <article className="freshness-summary stale"><span className="eyebrow">STALE</span><strong>{staleCount}</strong><p>Metrics overdue by at least three review intervals.</p></article>
      </div>

      <MonitorStatusPanel />

      <div className="section-heading updates-heading">
        <div><span className="eyebrow">CHANGE LOG</span><h2>Evidence that actually moved</h2></div>
        <p>The feed records changes to the evidence or its interpretation. Routine “checked, no change” reviews live in the freshness layer instead of cluttering the timeline.</p>
      </div>

      <div className="interactive-controls controls-panel updates-controls">
        <SegmentedControl
          label="Category"
          value={category}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Benchmarks', value: 'Benchmarks' },
            { label: 'Agents', value: 'Agents' },
            { label: 'Scaling', value: 'Scaling' },
            { label: 'Economics', value: 'Economics' },
            { label: 'Methodology', value: 'Methodology' },
          ]}
          onChange={setCategory}
        />
        <SegmentedControl
          label="Source"
          value={source}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Epoch', value: 'Epoch AI' },
            { label: 'METR', value: 'METR' },
            { label: 'ARC', value: 'ARC Prize' },
            { label: 'Scale', value: 'Scale AI' },
            { label: 'OpenAI', value: 'OpenAI' },
          ]}
          onChange={setSource}
        />
      </div>

      <div className="filter-summary">Showing <strong>{visible.length}</strong> of {updateEvents.length} recorded changes</div>

      <div className="updates-feed">
        {visible.map((event) => (
          <article className={`update-row update-${event.category.toLowerCase()}`} key={event.id}>
            <div className="update-date">{formatEventDate(event.date, event.id)}</div>
            <div className="update-marker" aria-hidden="true"><span /></div>
            <div className="update-content">
              <div className="update-topline"><span className="eyebrow">{event.category}</span>{event.changeLabel && <strong>{event.changeLabel}</strong>}</div>
              <h2>{event.title}</h2>
              <p>{event.summary}</p>
              {event.note && <p className="update-note">{event.note}</p>}
              <div className="update-actions">
                <a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.source} ↗</a>
                {event.metricId && <Link to={`/metric/${event.metricId}`}>Open metric →</Link>}
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="freshness-audit-section">
        <div className="section-heading">
          <div><span className="eyebrow">FRESHNESS AUDIT</span><h2>When was each metric last checked?</h2></div>
          <p>“Verified” means the site checked the original source for revisions. It does not mean the source itself published a new datapoint on that date.</p>
        </div>
        <div className="freshness-table-wrap">
          <table className="freshness-table">
            <thead><tr><th>Metric</th><th>Status</th><th>Source snapshot</th><th>Last verified</th><th>Review cadence</th><th>Next review due</th></tr></thead>
            <tbody>
              {freshnessRows.map(({ metric, freshness }) => freshness && (
                <tr key={metric.id}>
                  <td><Link to={`/metric/${metric.id}`}>{metric.label}</Link></td>
                  <td><FreshnessBadge metricId={metric.id} compact /></td>
                  <td>{freshness.sourceVersion ?? `Source as of ${metric.asOf}`}</td>
                  <td>{formatFreshnessDate(freshness.lastVerified)}</td>
                  <td>{freshness.reviewLabel}</td>
                  <td>{formatFreshnessDate(freshness.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="updates-method-callout">
        <span className="eyebrow">THE RULE</span>
        <h2>No silent ageing.</h2>
        <p>If a source changes, a benchmark is retired, a methodology is revised or a metric simply goes too long without being checked, the site should say so. Freshness is part of the evidence, not decoration.</p>
        <Link to="/methodology" className="text-link">Read the methodology →</Link>
      </aside>
    </section>
  )
}
