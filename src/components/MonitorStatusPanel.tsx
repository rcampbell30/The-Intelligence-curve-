import { useEffect, useState } from 'react'

type MonitorState = {
  id: string
  label: string
  url: string
  metricIds: string[]
  status: 'awaiting-first-run' | 'healthy' | 'review-needed' | 'error'
  pendingReview: boolean
  lastChecked?: string
  lastSuccess?: string
  changeDetectedAt?: string
  error?: string
}

type MonitorStatus = {
  generatedAt: string
  schedule: string
  monitors: MonitorState[]
  pendingReviewCount: number
}

function formatTimestamp(value?: string) {
  if (!value) return 'Not run yet'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(new Date(value))
}

function statusLabel(status: MonitorState['status']) {
  if (status === 'healthy') return 'Healthy'
  if (status === 'review-needed') return 'Review needed'
  if (status === 'error') return 'Check failed'
  return 'Awaiting first run'
}

export default function MonitorStatusPanel() {
  const [data, setData] = useState<MonitorStatus | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/monitor-status')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<MonitorStatus>
      })
      .then((payload) => {
        if (active) setData(payload)
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => { active = false }
  }, [])

  return (
    <section className="monitoring-section">
      <div className="section-heading">
        <div><span className="eyebrow">AUTOMATIC SOURCE MONITORS</span><h2>Watching the evidence for changes</h2></div>
        <p>These checks never rewrite public metrics automatically. A changed source is flagged for review first, so parser noise or methodology changes cannot silently become “evidence”.</p>
      </div>

      {error ? (
        <div className="monitoring-error">Monitor status is temporarily unavailable. The public metric data is unaffected.</div>
      ) : !data ? (
        <div className="monitoring-loading">Loading monitor health…</div>
      ) : (
        <>
          <div className="monitoring-summary">
            <div><span>Schedule</span><strong>{data.schedule}</strong></div>
            <div><span>Sources watched</span><strong>{data.monitors.length}</strong></div>
            <div><span>Pending review</span><strong>{data.pendingReviewCount}</strong></div>
          </div>
          <div className="monitoring-grid">
            {data.monitors.map((monitor) => (
              <article className={`monitor-card monitor-${monitor.status}`} key={monitor.id}>
                <div className="monitor-card-top">
                  <span className="monitor-dot" aria-hidden="true" />
                  <strong>{statusLabel(monitor.status)}</strong>
                </div>
                <h3>{monitor.label}</h3>
                <p>Last checked: {formatTimestamp(monitor.lastChecked)}</p>
                {monitor.status === 'review-needed' && <p className="monitor-note">Source changed. Candidate values are held in the private draft queue until reviewed.</p>}
                {monitor.status === 'error' && <p className="monitor-note">The latest check failed. The last published metric remains unchanged.</p>}
                <a href={monitor.url} target="_blank" rel="noreferrer">Open source ↗</a>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
