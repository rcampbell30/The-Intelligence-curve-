import { applyReportSnapshots, type FrozenReportSnapshot } from './reports'

type ReportStatePayload = {
  snapshots?: FrozenReportSnapshot[]
}

export async function loadReportSnapshots() {
  try {
    const response = await fetch('/api/report-state')
    if (!response.ok) return
    const payload = await response.json() as ReportStatePayload
    if (payload.snapshots?.length) applyReportSnapshots(payload.snapshots)
  } catch {
    // Static current-month definitions remain available if the runtime archive is unavailable.
  }
}
