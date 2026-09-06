import { updateEvents } from './updates'

export type ReportStatus = 'month-to-date' | 'final'

export type MonthlyReport = {
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

export const monthlyReports: MonthlyReport[] = [
  {
    slug: '2026-09',
    period: 'September 2026',
    title: 'State of AI Progress — September 2026',
    status: 'month-to-date',
    publishedAt: '2026-09-06',
    updatedAt: '2026-09-06',
    deck: 'A month-to-date evidence brief covering the clearest movements in frontier capability, autonomous work and the infrastructure behind AI progress.',
    takeaway: 'The strongest accepted movement so far this month is in frontier capability measurement: HLE, ARC-AGI-3 and the ECI reasoning-era trend all point to unusually rapid gains, but they measure different things and should not be collapsed into one “intelligence score”.',
    signalMetricIds: ['hle-frontier', 'astra-arc-agi-3', 'eci-frontier', 'agent-time-horizon'],
    eventIds: ['hle-46-5', 'astra-arc-agi-3', 'eci-reasoning-frontier'],
    quietSignals: [
      {
        label: 'Agent autonomy',
        text: 'No new METR task-horizon release has been accepted into the site this month. Time Horizon 1.1 remains the active methodology and the latest mirrored model-level horizon remains separately visible on the Agents view.',
      },
      {
        label: 'Core scaling trends',
        text: 'No approved September revision to Epoch’s core compute-stock, training-compute or context-window trend fits is recorded yet. The source monitors now watch those pages for changes.',
      },
      {
        label: 'Inference economics',
        text: 'The site still treats the ~50×/year inference-price figure as a historical median fit, not a September market-price observation or forecast.',
      },
    ],
    methodology: 'Month-to-date reports include only evidence already accepted into The Intelligence Curve. A monitored source change that is still waiting for review is not promoted into the report. Final editions can freeze their snapshot at month-end so later leaderboard movement does not rewrite the historical record.',
  },
]

export function getReport(slug: string) {
  return monthlyReports.find((report) => report.slug === slug)
}

export function getReportEvents(report: MonthlyReport) {
  return report.eventIds
    .map((id) => updateEvents.find((event) => event.id === id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function reportStatusLabel(status: ReportStatus) {
  return status === 'final' ? 'Final edition' : 'Month to date'
}
