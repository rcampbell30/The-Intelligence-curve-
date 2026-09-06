import { formatFreshnessDate, getFreshness } from '../data/freshness'

type FreshnessBadgeProps = {
  metricId: string
  compact?: boolean
}

const labels = {
  current: 'Current',
  due: 'Review due',
  stale: 'Stale',
} as const

export default function FreshnessBadge({ metricId, compact = false }: FreshnessBadgeProps) {
  const freshness = getFreshness(metricId)
  if (!freshness) return null

  return (
    <span
      className={`freshness-badge freshness-${freshness.status}${compact ? ' compact' : ''}`}
      title={`Last verified ${formatFreshnessDate(freshness.lastVerified)} · ${freshness.reviewLabel}`}
    >
      <i aria-hidden="true" />
      <span>{labels[freshness.status]}</span>
      {!compact && <small>verified {formatFreshnessDate(freshness.lastVerified)}</small>}
    </span>
  )
}
