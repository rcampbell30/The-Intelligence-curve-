import type { Metric } from './metrics'
import { updateEvents, type UpdateEvent } from './updates'

export type ReportStatus = 'month-to-date' | 'final'

export type ReportDefinition = {
  slug: string
  period: string
  title: string
  status: ReportStatus
  publishedAt: string
  updatedAt: string
  deck: string
  takeaway: string
  signalMetricIds: string[]
  eventIds: string[]
  quietSignals: { label: string; text: string }[]
  methodology: string
}

export type FrozenMetricSignal = Pick<Metric,
  'id' | 'category' | 'label' | 'headline' | 'secondary' | 'summary' | 'source' | 'sourceUrl' | 'asOf' | 'evidenceKind' | 'caution'
>

export type FrozenReportSnapshot = {
  version: 1
  finalizedAt: string
  report: ReportDefinition
  signals: FrozenMetricSignal[]
  events: UpdateEvent[]
}

export type MonthlyReport = ReportDefinition & {
  snapshot?: FrozenReportSnapshot
}

const REPORT_START = '2026-09'
const SIGNAL_METRIC_IDS = ['hle-frontier', 'astra-arc-agi-3', 'eci-frontier', 'agent-time-horizon']

export function monthSlug(date = new Date()) {
  return date.toISOString().slice(0, 7)
}

function monthPeriod(slug: string) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${slug}-01T00:00:00Z`))
}

function monthsFromStart(currentSlug = monthSlug()) {
  const [startYear, startMonth] = REPORT_START.split('-').map(Number)
  const [endYear, endMonth] = currentSlug.split('-').map(Number)
  const result: string[] = []
  let year = startYear
  let month = startMonth

  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push(`${year}-${String(month).padStart(2, '0')}`)
    month += 1
    if (month === 13) {
      month = 1
      year += 1
    }
  }

  return result.reverse()
}

function genericQuietSignals() {
  return [
    {
      label: 'Agent autonomy',
      text: 'No new accepted METR task-horizon release is recorded for this month unless it appears in the accepted movement feed. The active methodology remains visible on the Agents view.',
    },
    {
      label: 'Core scaling trends',
      text: 'Compute-stock, training-compute and context-window trend fits remain unchanged unless a monitored source revision is reviewed and accepted into the public evidence layer.',
    },
    {
      label: 'Inference economics',
      text: 'The inference-price headline remains a historical median fit unless a new source-backed analysis is accepted. It is not treated as a live market-price observation.',
    },
  ]
}

export function buildReportDefinition(slug: string): ReportDefinition {
  const period = monthPeriod(slug)
  const events = updateEvents.filter((event) => event.date.startsWith(slug))
  const latestEventDate = [...events].sort((a, b) => b.date.localeCompare(a.date))[0]?.date

  if (slug === '2026-09') {
    return {
      slug,
      period,
      title: 'State of AI Progress — September 2026',
      status: 'month-to-date',
      publishedAt: '2026-09-06',
      updatedAt: latestEventDate ?? '2026-09-06',
      deck: 'A month-to-date evidence brief covering the clearest movements in frontier capability, autonomous work and the infrastructure behind AI progress.',
      takeaway: 'The strongest accepted movement so far this month is in frontier capability measurement: HLE, ARC-AGI-3 and the ECI reasoning-era trend all point to unusually rapid gains, but they measure different things and should not be collapsed into one “intelligence score”.',
      signalMetricIds: SIGNAL_METRIC_IDS,
      eventIds: events.map((event) => event.id),
      quietSignals: [
        {
          label: 'Agent autonomy',
          text: 'No new METR task-horizon release has been accepted into the site this month. Time Horizon 1.1 remains the active methodology and the latest mirrored model-level horizon remains separately visible on the Agents view.',
        },
        {
          label: 'Core scaling trends',
          text: 'No approved September revision to Epoch’s core compute-stock, training-compute or context-window trend fits is recorded yet. The source monitors watch those pages for changes.',
        },
        {
          label: 'Inference economics',
          text: 'The site still treats the ~50×/year inference-price figure as a historical median fit, not a September market-price observation or forecast.',
        },
      ],
      methodology: 'Month-to-date reports include only evidence already accepted into The Intelligence Curve. A monitored source change that is still waiting for review is not promoted into the report. At month-end, the accepted metric values and event records are frozen into a write-once snapshot so later leaderboard movement cannot rewrite the historical edition.',
    }
  }

  return {
    slug,
    period,
    title: `State of AI Progress — ${period}`,
    status: 'month-to-date',
    publishedAt: `${slug}-01`,
    updatedAt: latestEventDate ?? `${slug}-01`,
    deck: `A month-to-date evidence brief covering accepted movement in frontier capability, autonomous work, infrastructure and AI economics during ${period}.`,
    takeaway: events.length
      ? `${events.length} accepted source-linked movement${events.length === 1 ? '' : 's'} ${events.length === 1 ? 'is' : 'are'} currently recorded for ${period}. The report keeps benchmark results, fitted trends and infrastructure records separate rather than combining them into one progress score.`
      : `No accepted source-linked movement is recorded yet for ${period}. The live evidence cards below still show the current accepted state while monitored candidates remain excluded until review.`,
    signalMetricIds: SIGNAL_METRIC_IDS,
    eventIds: events.map((event) => event.id),
    quietSignals: genericQuietSignals(),
    methodology: 'The active monthly report reads from the accepted public evidence layer. At month-end, a scheduled rollover stores the report definition, accepted metric values and event records as a write-once snapshot. The next month then opens automatically as a new live edition.',
  }
}

export const monthlyReports: MonthlyReport[] = monthsFromStart().map(buildReportDefinition)

export function applyReportSnapshots(snapshots: FrozenReportSnapshot[]) {
  for (const snapshot of snapshots) {
    const report: MonthlyReport = { ...snapshot.report, status: 'final', snapshot }
    const index = monthlyReports.findIndex((item) => item.slug === report.slug)
    if (index >= 0) monthlyReports[index] = report
    else monthlyReports.push(report)
  }

  monthlyReports.sort((a, b) => b.slug.localeCompare(a.slug))
}

export function getReport(slug: string) {
  return monthlyReports.find((report) => report.slug === slug)
}

export function getReportEvents(report: MonthlyReport) {
  if (report.snapshot) return [...report.snapshot.events].sort((a, b) => b.date.localeCompare(a.date))

  return report.eventIds
    .map((id) => updateEvents.find((event) => event.id === id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function reportStatusLabel(status: ReportStatus) {
  return status === 'final' ? 'Final edition' : 'Month to date'
}
