import type { Metric } from '../data/metrics'

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
      <div className="metric-source">
        <a href={metric.sourceUrl} target="_blank" rel="noreferrer">{metric.source} ↗</a>
        <span>as of {metric.asOf}</span>
      </div>
    </article>
  )
}
