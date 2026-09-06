import type { Config } from '@netlify/functions'
import { getReport, monthSlug } from '../../src/data/reports'

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[character] ?? character)
}

export default async (req: Request) => {
  const slug = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? ''
  const report = getReport(slug)
  if (!report) return new Response('Report not found', { status: 404 })

  const status = slug === monthSlug() ? 'MONTH TO DATE' : 'FINAL EDITION'
  const period = escapeXml(report.period)
  const reportUrl = escapeXml(`intelligencecurve.netlify.app/reports/${report.slug}`)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#080a0d"/><stop offset="1" stop-color="#11151a"/></linearGradient>
      <radialGradient id="glow" cx="88%" cy="6%" r="55%"><stop stop-color="#b9ff66" stop-opacity=".18"/><stop offset="1" stop-color="#b9ff66" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <rect x="34" y="34" width="1132" height="562" fill="none" stroke="#ffffff" stroke-opacity=".12"/>
    <text x="72" y="88" fill="#b9ff66" font-family="Arial, sans-serif" font-size="21" font-weight="700" letter-spacing="2">THE INTELLIGENCE CURVE</text>
    <text x="72" y="126" fill="#8c949d" font-family="monospace" font-size="18" letter-spacing="1.5">STATE OF AI PROGRESS</text>
    <rect x="884" y="70" width="244" height="44" rx="22" fill="#b9ff66" fill-opacity=".08" stroke="#b9ff66" stroke-opacity=".35"/>
    <text x="1006" y="98" text-anchor="middle" fill="#b9ff66" font-family="monospace" font-size="15" font-weight="700" letter-spacing="1">${status}</text>
    <text x="72" y="252" fill="#f3f5f4" font-family="Arial, sans-serif" font-size="72" font-weight="700" letter-spacing="-3">${period}</text>
    <text x="72" y="316" fill="#c7cec9" font-family="Arial, sans-serif" font-size="28">A source-first monthly record of what moved — and what did not.</text>
    <line x1="72" y1="378" x2="1128" y2="378" stroke="#ffffff" stroke-opacity=".1"/>
    <text x="72" y="432" fill="#8c949d" font-family="monospace" font-size="16" letter-spacing="1">OBSERVED ≠ FITTED ≠ PROJECTED</text>
    <text x="72" y="486" fill="#f3f5f4" font-family="Arial, sans-serif" font-size="24">Accepted evidence. Explicit methodology. Frozen final editions.</text>
    <line x1="72" y1="548" x2="1128" y2="548" stroke="#ffffff" stroke-opacity=".1"/>
    <text x="72" y="582" fill="#8c949d" font-family="monospace" font-size="15">${reportUrl}</text>
  </svg>`

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

export const config: Config = {
  path: '/report-og/*',
}
