import { Link, useParams } from 'react-router-dom'
import { metrics } from '../data/metrics'
import { getReport, getReportEvents, monthlyReports, reportStatusLabel } from '../data/reports'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

function statusClass(status: 'month-to-date' | 'final') {
  return status === 'final' ? 'report-status-final' : 'report-status-mtd'
}

export function ReportsPage() {
  const latest = monthlyReports[0]

  return (
    <section className="section-pad page-section reports-page">
      <div className="page-hero data-page-hero reports-hero">
        <span className="eyebrow">MONTHLY REPORTS</span>
        <h1>The state of AI progress,<br />one month at a time.</h1>
        <p>Permanent, source-linked briefs that separate what actually moved from what stayed unchanged — without turning a handful of benchmarks into a single fictional “AGI percentage”.</p>
        <div className="page-meta-row"><span>{monthlyReports.length} edition{monthlyReports.length === 1 ? '' : 's'}</span><span>Source-backed</span><span>Observed ≠ fitted ≠ projected</span></div>
      </div>

      {latest && (
        <Link className="latest-report-card" to={`/reports/${latest.slug}`}>
          <div className="latest-report-copy">
            <div className="report-card-topline">
              <span className="eyebrow">LATEST EDITION</span>
              <span className={`report-status ${statusClass(latest.status)}`}>{reportStatusLabel(latest.status)}</span>
            </div>
            <h2>{latest.title}</h2>
            <p>{latest.deck}</p>
            <div className="latest-report-meta"><span>Updated {formatDate(latest.updatedAt)}</span><span>{latest.eventIds.length} accepted movements</span><span>{latest.signalMetricIds.length} headline signals</span></div>
          </div>
          <span className="latest-report-arrow" aria-hidden="true">↗</span>
        </Link>
      )}

      <div className="section-heading reports-heading">
        <div><span className="eyebrow">ARCHIVE</span><h2>Every edition stays legible</h2></div>
        <p>Month-to-date editions can reflect newly approved evidence. Final editions are designed to freeze the historical snapshot so later leaderboard changes do not rewrite the past.</p>
      </div>

      <div className="report-archive-grid">
        {monthlyReports.map((report) => (
          <Link className="report-archive-card" to={`/reports/${report.slug}`} key={report.slug}>
            <div className="report-card-topline"><span>{report.period}</span><span className={`report-status ${statusClass(report.status)}`}>{reportStatusLabel(report.status)}</span></div>
            <h3>{report.title}</h3>
            <p>{report.deck}</p>
            <span className="text-link">Read report →</span>
          </Link>
        ))}
      </div>

      <aside className="reports-method-callout">
        <span className="eyebrow">PUBLICATION RULE</span>
        <h2>Movement and silence both count.</h2>
        <p>A credible progress report should say when a benchmark moved, when a methodology changed — and when an important source did not produce a new accepted result. The absence of movement is part of the record.</p>
        <Link className="text-link" to="/methodology">Read the methodology →</Link>
      </aside>
    </section>
  )
}

export function MonthlyReportPage() {
  const { reportSlug = '' } = useParams()
  const report = getReport(reportSlug)

  if (!report) {
    return (
      <section className="section-pad page-section report-not-found">
        <span className="eyebrow">REPORT NOT FOUND</span>
        <h1>That monthly edition does not exist.</h1>
        <Link className="text-link" to="/reports">← View all reports</Link>
      </section>
    )
  }

  const events = getReportEvents(report)
  const signals = report.signalMetricIds
    .map((id) => metrics.find((metric) => metric.id === id))
    .filter((metric): metric is NonNullable<typeof metric> => Boolean(metric))

  return (
    <article className="section-pad page-section monthly-report-page">
      <Link className="report-back-link" to="/reports">← Monthly reports</Link>

      <header className="monthly-report-hero">
        <div className="report-card-topline">
          <span className="eyebrow">STATE OF AI PROGRESS</span>
          <span className={`report-status ${statusClass(report.status)}`}>{reportStatusLabel(report.status)}</span>
        </div>
        <h1>{report.period}</h1>
        <p>{report.deck}</p>
        <div className="page-meta-row"><span>Published {formatDate(report.publishedAt)}</span><span>Updated {formatDate(report.updatedAt)}</span><span>{events.length} accepted movements</span></div>
      </header>

      <section className="report-section">
        <div className="section-heading compact-heading">
          <div><span className="eyebrow">AT A GLANCE</span><h2>The current evidence snapshot</h2></div>
          <p>These cards reuse the dashboard’s accepted metric layer, including any reviewed runtime overrides while this edition remains month-to-date.</p>
        </div>
        <div className="report-signal-grid">
          {signals.map((signal) => (
            <Link to={`/metric/${signal.id}`} className="report-signal-card" key={signal.id}>
              <span className="eyebrow">{signal.category}</span>
              <strong>{signal.headline}</strong>
              <h3>{signal.label}</h3>
              <p>{signal.secondary}</p>
              <small>Source · {signal.source} · as of {formatDate(signal.asOf)}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="report-section report-takeaway">
        <span className="eyebrow">READING THE CURVE</span>
        <h2>The month-to-date takeaway</h2>
        <p>{report.takeaway}</p>
      </section>

      <section className="report-section">
        <div className="section-heading compact-heading">
          <div><span className="eyebrow">WHAT MOVED</span><h2>Accepted changes this month</h2></div>
          <p>Only source changes already accepted into the public evidence layer appear here. Pending review candidates stay out.</p>
        </div>
        <div className="report-events-list">
          {events.map((event) => (
            <article className="report-event" key={event.id}>
              <time dateTime={event.date}>{formatDate(event.date)}</time>
              <div>
                <div className="report-event-topline"><span className="eyebrow">{event.category}</span>{event.changeLabel && <strong>{event.changeLabel}</strong>}</div>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
                {event.note && <p className="report-event-note">{event.note}</p>}
                <div className="report-event-actions">
                  <a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.source} ↗</a>
                  {event.metricId && <Link to={`/metric/${event.metricId}`}>Open metric →</Link>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="report-section">
        <div className="section-heading compact-heading">
          <div><span className="eyebrow">WHAT DIDN'T MOVE</span><h2>Important signals without a new accepted update</h2></div>
          <p>Silence is useful information when a source is actively monitored and its accepted evidence has not changed.</p>
        </div>
        <div className="quiet-signal-grid">
          {report.quietSignals.map((item) => (
            <article key={item.label}><span className="eyebrow">UNCHANGED / NO NEW ACCEPTED RESULT</span><h3>{item.label}</h3><p>{item.text}</p></article>
          ))}
        </div>
      </section>

      <aside className="report-methodology-note">
        <span className="eyebrow">HOW THIS REPORT IS BUILT</span>
        <p>{report.methodology}</p>
        <div><Link className="text-link" to="/updates">See the full update feed →</Link><Link className="text-link" to="/methodology">Methodology →</Link></div>
      </aside>
    </article>
  )
}
