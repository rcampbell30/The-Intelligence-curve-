import type { Config } from '@netlify/functions'
import { metrics } from '../../src/data/metrics'
import { monthlyReports } from '../../src/data/reports'

const SITE_URL = 'https://intelligencecurve.netlify.app'

const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/trends', changefreq: 'weekly', priority: '0.9' },
  { path: '/velocity', changefreq: 'weekly', priority: '0.9' },
  { path: '/updates', changefreq: 'daily', priority: '0.95' },
  { path: '/reports', changefreq: 'monthly', priority: '0.9' },
  { path: '/then-vs-now', changefreq: 'weekly', priority: '0.9' },
  { path: '/benchmarks', changefreq: 'weekly', priority: '0.8' },
  { path: '/agents', changefreq: 'weekly', priority: '0.8' },
  { path: '/scaling', changefreq: 'weekly', priority: '0.8' },
  { path: '/timeline', changefreq: 'weekly', priority: '0.7' },
  { path: '/methodology', changefreq: 'monthly', priority: '0.7' },
]

function urlEntry(path: string, changefreq: string, priority: string) {
  const loc = `${SITE_URL}${path === '/' ? '/' : path}`
  return `  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}

export default async () => {
  const entries = [
    ...routes.map((route) => urlEntry(route.path, route.changefreq, route.priority)),
    ...monthlyReports.map((report, index) => urlEntry(`/reports/${report.slug}`, report.status === 'final' ? 'never' : 'weekly', index === 0 ? '0.95' : '0.75')),
    ...metrics.map((metric) => urlEntry(`/metric/${metric.id}`, 'weekly', metric.category === 'Agents' || metric.id === 'hle-frontier' || metric.id === 'astra-arc-agi-3' ? '0.8' : '0.7')),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`
  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

export const config: Config = {
  path: '/sitemap.xml',
}
