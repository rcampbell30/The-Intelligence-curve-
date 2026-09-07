import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { metrics } from '../data/metrics'
import { timeHorizonModels } from '../data/progress'
import { updateEvents } from '../data/updates'

type MonitorState = {
  id: string
  status: 'awaiting-first-run' | 'healthy' | 'review-needed' | 'error'
  pendingReview: boolean
}

type MonitorStatus = {
  generatedAt: string
  monitors: MonitorState[]
  pendingReviewCount: number
}

function metric(id: string) {
  return metrics.find((item) => item.id === id)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

export default function AIPulse() {
  const [monitorStatus, setMonitorStatus] = useState<MonitorStatus | null>(null)
  const [monitorError, setMonitorError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/monitor-status')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<MonitorStatus>
      })
      .then((payload) => {
        if (active) setMonitorStatus(payload)
      })
      .catch(() => {
        if (active) setMonitorError(true)
      })
    return () => { active = false }
  }, [])

  const hle = metric('hle-frontier')
  const arc = metric('astra-arc-agi-3')
  const eci = metric('eci-frontier')
  const latestAgent = timeHorizonModels.at(-1)

  const latestMovements = useMemo(() => [...updateEvents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4), [])

  const healthy = monitorStatus?.monitors.filter((item) => item.status === 'healthy').length ?? 0
  const total = monitorStatus?.monitors.length ?? 9
  const pending = monitorStatus?.pendingReviewCount ?? 0
  const failed = monitorStatus?.monitors.filter((item) => item.status === 'error').length ?? 0
  const awaiting = monitorStatus?.monitors.filter((item) => item.status === 'awaiting-first-run').length ?? 0

  let monitorLabel = 'Checking monitor health…'
  let monitorClass = 'pulse-monitor-neutral'
  if (monitorError) {
    monitorLabel = 'Monitor status unavailable'
    monitorClass = 'pulse-monitor-error'
  } else if (monitorStatus) {
    if (pending > 0) {
      monitorLabel = `${pending} source${pending === 1 ? '' : 's'} need${pending === 1 ? 's' : ''} review`
      monitorClass = 'pulse-monitor-review'
    } else if (failed > 0) {
      monitorLabel = `${failed} monitor${failed === 1 ? '' : 's'} failed latest check`
      monitorClass = 'pulse-monitor-error'
    } else if (awaiting > 0) {
      monitorLabel = `${healthy}/${total} monitors healthy · ${awaiting} awaiting first run`
      monitorClass = 'pulse-monitor-neutral'
    } else {
      monitorLabel = `${healthy}/${total} source monitors healthy`
      monitorClass = 'pulse-monitor-healthy'
    }
  }

  const pulseSignals = [
    {
      label: 'HLE frontier',
      value: hle?.headline ?? '—',
      detail: hle?.secondary ?? 'Humanity’s Last Exam',
      path: '/metric/hle-frontier',
    },
    {
      label: 'ARC-AGI-3',
      value: arc?.headline ?? '—',
      detail: arc?.secondary ?? 'Astra standard harness',
      path: '/metric/astra-arc-agi-3',
    },
    {
      label: 'Agent horizon',
      value: latestAgent ? `${latestAgent.minutes} min` : '—',
      detail: latestAgent?.model ?? 'Latest mirrored model',
      path: '/metric/agent-time-horizon',
    },
    {
      label: 'ECI frontier',
      value: eci?.headline ?? '—',
      detail: eci?.secondary ?? 'Reasoning-model frontier',
      path: '/metric/eci-frontier',
    },
  ]

  return (
    <section className="section-pad ai-pulse-section" aria-labelledby="ai-pulse-title">
      <div className="ai-pulse-shell">
        <div className="ai-pulse-topline">
          <div>
            <span className="eyebrow">AI PULSE</span>
            <h2 id="ai-pulse-title">The frontier at a glance.</h2>
          </div>
          <Link to="/updates" className={`pulse-monitor-pill ${monitorClass}`}>
            <span aria-hidden="true" />
            {monitorLabel}
            <b>→</b>
          </Link>
        </div>

        <div className="pulse-signal-grid">
          {pulseSignals.map((signal) => (
            <Link className="pulse-signal" to={signal.path} key={signal.label}>
              <span>{signal.label}</span>
              <strong>{signal.value.split(/\s(.+)/)[0]}{signal.value.includes(' ') && <span className="pulse-unit"> {signal.value.slice(signal.value.indexOf(' ') + 1)}</span>}</strong>
              <small>{signal.detail}</small>
              <i aria-hidden="true">↗</i>
            </Link>
          ))}
        </div>

        <div className="pulse-movement-panel">
          <div className="pulse-movement-heading">
            <div><span className="eyebrow">LATEST MOVEMENT</span><h3>What changed most recently</h3></div>
            <Link to="/updates">Full update feed →</Link>
          </div>
          <div className="pulse-movement-list">
            {latestMovements.map((event) => (
              <article key={event.id}>
                <time dateTime={event.date}>{formatDate(event.date)}</time>
                <div>
                  <span>{event.category}</span>
                  <h4>{event.title}</h4>
                  {event.changeLabel && <strong>{event.changeLabel}</strong>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
