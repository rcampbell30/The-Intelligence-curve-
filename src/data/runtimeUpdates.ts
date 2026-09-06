import { refreshLiveReports } from './reports'
import { mergeRuntimeUpdateEvents, type UpdateEvent } from './updates'

type RuntimeUpdatesPayload = {
  events?: UpdateEvent[]
}

export async function loadRuntimeUpdates() {
  try {
    const response = await fetch('/api/runtime-updates')
    if (!response.ok) return
    const payload = await response.json() as RuntimeUpdatesPayload
    if (!Array.isArray(payload.events)) return
    mergeRuntimeUpdateEvents(payload.events)
    refreshLiveReports()
  } catch {
    // Static accepted events remain the safe fallback if the runtime feed is unavailable.
  }
}
