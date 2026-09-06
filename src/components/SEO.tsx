import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { metrics } from '../data/metrics'

export const SITE_URL = 'https://intelligencecurve.netlify.app'
const SITE_NAME = 'The Intelligence Curve'
const DEFAULT_DESCRIPTION = 'Tracking the pace of AI progress across capability, autonomy, compute, efficiency and cost — with observed results, historical trend fits and projections kept separate.'
const OG_IMAGE = `${SITE_URL}/.netlify/images?url=/og-image.svg&w=1200&h=630&fit=cover&fm=png`

const pages: Record<string, { title: string; description: string }> = {
  '/': { title: 'The Intelligence Curve — Tracking the pace of AI progress', description: DEFAULT_DESCRIPTION },
  '/trends': { title: 'AI Trends — The Intelligence Curve', description: 'Compare historical rates across AI capability, compute, context, efficiency, cost and autonomous work.' },
  '/velocity': { title: 'AI Velocity — The Intelligence Curve', description: 'Compare how quickly major AI progress indicators are changing using source-backed doubling and halving times.' },
  '/updates': { title: 'AI Progress Updates — The Intelligence Curve', description: 'A source-linked AI progress change log with freshness status, verification dates and review cadence for every headline metric.' },
  '/review': { title: 'Private Review — The Intelligence Curve', description: 'Protected editorial review workflow for monitored source changes.' },
  '/then-vs-now': { title: 'Then vs Now — The Intelligence Curve', description: 'Before-and-after comparisons showing how frontier AI capability, autonomy, infrastructure and economics have changed.' },
  '/benchmarks': { title: 'AI Benchmarks — The Intelligence Curve', description: 'Track frontier benchmark results historically with source, harness and methodology context preserved.' },
  '/agents': { title: 'AI Agent Autonomy — The Intelligence Curve', description: 'Track the task-completion horizons of frontier AI agents and how reliable autonomous work is changing.' },
  '/scaling': { title: 'AI Scaling — The Intelligence Curve', description: 'Track training compute, data-centre capacity, power and the physical infrastructure behind frontier AI.' },
  '/timeline': { title: 'AI Progress Timeline — The Intelligence Curve', description: 'A source-linked chronology of major AI capability, agent and infrastructure milestones.' },
  '/methodology': { title: 'Methodology — The Intelligence Curve', description: 'How The Intelligence Curve separates observed evidence, historical trend fits and future extrapolations.' },
}

function ensureMeta(property: string, value: string, byProperty = false) {
  const attr = byProperty ? 'property' : 'name'
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`)
  if (!node) {
    node = document.createElement('meta')
    node.setAttribute(attr, property)
    document.head.appendChild(node)
  }
  node.content = value
}

function ensureCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = url
}

export default function SEO() {
  const location = useLocation()

  useEffect(() => {
    const pathname = location.pathname.replace(/\/$/, '') || '/'
    const metricId = pathname.startsWith('/metric/') ? pathname.split('/').pop() : undefined
    const metric = metricId ? metrics.find((item) => item.id === metricId) : undefined

    const title = metric ? `${metric.label} — The Intelligence Curve` : (pages[pathname]?.title ?? SITE_NAME)
    const description = metric ? `${metric.summary} ${metric.secondary}. Source: ${metric.source}.` : (pages[pathname]?.description ?? DEFAULT_DESCRIPTION)
    const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`
    const isPrivateReview = pathname === '/review'

    document.title = title
    ensureMeta('description', description)
    ensureMeta('robots', isPrivateReview ? 'noindex,nofollow,noarchive' : 'index,follow')
    ensureMeta('og:title', title, true)
    ensureMeta('og:description', description, true)
    ensureMeta('og:url', canonical, true)
    ensureMeta('og:type', metric ? 'article' : 'website', true)
    ensureMeta('og:site_name', SITE_NAME, true)
    ensureMeta('og:image', OG_IMAGE, true)
    ensureMeta('og:image:width', '1200', true)
    ensureMeta('og:image:height', '630', true)
    ensureMeta('twitter:card', 'summary_large_image')
    ensureMeta('twitter:title', title)
    ensureMeta('twitter:description', description)
    ensureMeta('twitter:image', OG_IMAGE)
    ensureCanonical(canonical)

    let script = document.head.querySelector<HTMLScriptElement>('#tic-structured-data')
    if (!script) {
      script = document.createElement('script')
      script.id = 'tic-structured-data'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    script.text = JSON.stringify(metric ? {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: metric.label,
      description: metric.summary,
      url: canonical,
      dateModified: metric.asOf,
      creator: { '@type': 'Organization', name: SITE_NAME },
      citation: metric.sourceUrl,
    } : {
      '@context': 'https://schema.org',
      '@type': pathname === '/updates' ? 'CollectionPage' : 'WebSite',
      name: title,
      url: canonical,
      description,
      isPartOf: pathname === '/updates' ? { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL } : undefined,
    })
  }, [location.pathname])

  return null
}
