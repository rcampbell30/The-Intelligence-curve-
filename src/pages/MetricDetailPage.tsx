import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import FreshnessBadge from '../components/FreshnessBadge'
import ShareMetricCard from '../components/ShareMetricCard'
import { formatFreshnessDate, getFreshness } from '../data/freshness'
import { metricDetails } from '../data/metricDetails'
import { metrics } from '../data/metrics'

const compactNumber = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 })

export default function MetricDetailPage() {
  const { metricId } = useParams()
  const metric = metrics.find((item) => item.id === metricId)
  const detail = metricId ? metricDetails[metricId] : undefined

  useEffect(() => {
    if (!metric) return
    const previousTitle = document.title
    document.title = `${metric.label} — The Intelligence Curve`
    return () => { document.title = previousTitle }
  }, [metric])

  if (!metric || !detail) {
    return (
      <section className="section-pad page-section metric-detail-page">
        <div className="metric-not-found">
          <span className="eyebrow">METRIC NOT FOUND</span>
          <h1>That curve isn’t in the dataset.</h1>
          <p>The metric may have been renamed or removed after a methodology update.</p>
          <Link className="button primary" to="/trends">Browse current metrics →</Link>
        </div>
      </section>
    )
  }

  const related = metrics.filter((item) => item.category === metric.category && item.id !== metric.id).slice(0, 3)
  const freshness = getFreshness(metric.id)
  const isLog = detail.seriesScale === 'log'
  const seriesValues = detail.series?.map((point) => point.value) ?? []
  const maxValue = seriesValues.length ? Math.max(...seriesValues) : 1

  return (
    <section className="section-pad page-section metric-detail-page">
      <div className="metric-detail-hero">
        <Link to="/trends" className="metric-back-link">← All metrics</Link>
        <div className="metric-detail-meta">
          <span className="eyebrow">{metric.category}</span>
          <span className={metric.evidenceKind === 'trend-fit' ? 'method-pill' : 'observed-pill'}>
            {metric.evidenceKind === 'trend-fit' ? 'Historical trend fit' : 'Observed result'}
          </span>
        </div>
        <h1>{metric.label}</h1>
        <div className="metric-detail-headline">{metric.headline}</div>
        <p className="metric-detail-secondary">{metric.secondary}</p>
        <p className="metric-detail-summary">{metric.summary}</p>
        {metric.caution && <p className="metric-detail-caution">{metric.caution}</p>}
        <div className="metric-detail-freshness">
          <FreshnessBadge metricId={metric.id} />
          {freshness && <span className="freshness-detail-copy">source snapshot {metric.asOf} · next review due {formatFreshnessDate(freshness.dueDate)}</span>}
        </div>
        <ShareMetricCard metric={metric} detail={detail} />
      </div>

      <div className="metric-explainer-grid">
        <article>
          <span className="eyebrow">DEFINITION</span>
          <h2>What is this measuring?</h2>
          <p>{detail.definition}</p>
        </article>
        <article>
          <span className="eyebrow">WHY IT MATTERS</span>
          <h2>Why watch this curve?</h2>
          <p>{detail.whyItMatters}</p>
        </article>
        <article>
          <span className="eyebrow">INTERPRETATION</span>
          <h2>How should you read it?</h2>
          <p>{detail.interpretation}</p>
        </article>
        <article>
          <span className="eyebrow">METHODOLOGY</span>
          <h2>Where does it come from?</h2>
          <p>{detail.methodology}</p>
        </article>
      </div>

      {detail.series && detail.series.length > 1 ? (
        <section className="metric-series-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HISTORICAL SERIES</span>
              <h2>{detail.seriesLabel}</h2>
            </div>
            <p>{detail.rawDataNote}</p>
          </div>

          <article className="data-chart-card metric-history-chart">
            <div className="data-chart-header">
              <div>
                <span className="eyebrow">SOURCE SERIES</span>
                <h3>{detail.series.length} mirrored datapoints</h3>
              </div>
              <span className="method-pill">{isLog ? 'Log scale' : 'Linear scale'}</span>
            </div>
            <div className="chart-wrap evidence-chart">
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={detail.series} margin={{ top: 20, right: 20, left: 8, bottom: 42 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.18} />
                  <XAxis dataKey="label" tick={{ fill: '#8c949d', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={70} />
                  <YAxis
                    scale={isLog ? 'log' : 'auto'}
                    domain={isLog ? [1, Math.max(10, maxValue * 1.35)] : [0, Math.max(1, maxValue * 1.1)]}
                    allowDataOverflow={isLog}
                    tickFormatter={(value) => detail.seriesUnit === '%' ? `${value}%` : detail.seriesUnit === 'minutes' ? `${compactNumber.format(Number(value))}m` : compactNumber.format(Number(value))}
                    tick={{ fill: '#8c949d' }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toLocaleString()}${detail.seriesUnit === '%' ? '%' : detail.seriesUnit === 'minutes' ? ' minutes' : ` ${detail.seriesUnit ?? ''}`}`, detail.seriesLabel ?? 'Value']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.detail ? `${label} · ${payload[0].payload.detail}` : String(label)}
                  />
                  <Line type="monotone" dataKey="value" stroke="#a4d98b" strokeWidth={3} dot={{ r: 4, fill: '#a4d98b' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <div className="raw-data-panel">
            <div className="raw-data-heading">
              <span className="eyebrow">RAW DATA</span>
              <span>{detail.series.length} rows</span>
            </div>
            <div className="raw-data-table-wrap">
              <table className="raw-data-table">
                <thead><tr><th>Point</th><th>Value</th><th>Context</th></tr></thead>
                <tbody>
                  {detail.series.map((point) => (
                    <tr key={`${point.label}-${point.value}`}>
                      <td>{point.label}</td>
                      <td>{point.value.toLocaleString()}{detail.seriesUnit === '%' ? '%' : detail.seriesUnit === 'minutes' ? ' min' : detail.seriesUnit ? ` ${detail.seriesUnit}` : ''}</td>
                      <td>{point.detail ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <aside className="series-pending-panel">
          <span className="eyebrow">SERIES STATUS</span>
          <h2>Headline sourced. Full series not yet mirrored.</h2>
          <p>{detail.rawDataNote}</p>
          <p>The Intelligence Curve does not generate synthetic historical points to make a chart look complete.</p>
        </aside>
      )}

      <div className="metric-source-panel">
        <div>
          <span className="eyebrow">PRIMARY SOURCE</span>
          <h2>{metric.source}</h2>
          <p>Source snapshot: {metric.asOf}{freshness ? ` · last verified ${formatFreshnessDate(freshness.lastVerified)}` : ''}</p>
        </div>
        <a className="button secondary" href={metric.sourceUrl} target="_blank" rel="noreferrer">Open original source ↗</a>
      </div>

      {freshness && (
        <div className="freshness-panel">
          <div>
            <span className="eyebrow">FRESHNESS POLICY</span>
            <h3>{freshness.reviewLabel}</h3>
            <p>{freshness.note ?? 'The original source is checked on this cadence for revised values, methodology changes or replacement datasets.'}</p>
          </div>
          <div className="freshness-panel-meta">
            <strong>{freshness.sourceVersion}</strong>
            <span>Verified {formatFreshnessDate(freshness.lastVerified)}</span>
            <span>Next review due {formatFreshnessDate(freshness.dueDate)}</span>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section className="related-metrics">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow">RELATED</span><h2>More {metric.category.toLowerCase()} indicators</h2></div>
          </div>
          <div className="related-metric-grid">
            {related.map((item) => (
              <Link to={`/metric/${item.id}`} className="related-metric-card" key={item.id}>
                <span>{item.label}</span>
                <strong>{item.headline}</strong>
                <small>{item.secondary}</small>
                <i>→</i>
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
