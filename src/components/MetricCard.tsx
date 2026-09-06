import { Link } from 'react-router-dom'
import type { Metric } from '../data/metrics'
import FreshnessBadge from './FreshnessBadge'

export default function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="metric-card">
      <div className="metric-topline">
        <span>{metric.category}</span>
        <span>{metric.evidenceKind === 'trend-fit' ? 'Trend fit' : 'Result'}</span>
      </div>
      <h3>{metric.label}</h3>
      <div className="metric-value">{metric.headline}</div>
      <div className="metric-secondary">{metric.secondary}</div>
      <p>{metric.summary}</p>
      {metric.caution && <p className="metric-caution">{metric.caution}</p>}
      <div className="metric-freshness-row">
        <FreshnessBadge metricId={metric.id} />
      </div>
      <Link className="metric-detail-link" to={`/metric/${metric.id}`}>Explore metric →</Link>
      <div className="metric-source">
        <a href={metric.sourceUrl} target="_blank" rel="noreferrer">{metric.source} ↗</a>
        <span>source snapshot {metric.asOf}</span>
      </div>
    </article>
  )
}
