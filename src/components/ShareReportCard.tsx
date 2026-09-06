import { useState } from 'react'
import { getReportEvents, reportStatusLabel, type MonthlyReport } from '../data/reports'

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4,
) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
      if (lines.length === maxLines - 1) break
    } else {
      line = candidate
    }
  }

  if (line && lines.length < maxLines) lines.push(line)
  lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight))
  return lines.length
}

function formatStatus(report: MonthlyReport) {
  return reportStatusLabel(report.status).toUpperCase()
}

async function createReportCard(report: MonthlyReport) {
  const events = getReportEvents(report).slice(0, 3)
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is unavailable')

  const gradient = ctx.createLinearGradient(0, 0, 1200, 630)
  gradient.addColorStop(0, '#080a0d')
  gradient.addColorStop(1, '#11151a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1200, 630)

  const glow = ctx.createRadialGradient(1040, 40, 0, 1040, 40, 500)
  glow.addColorStop(0, 'rgba(185,255,102,.18)')
  glow.addColorStop(1, 'rgba(185,255,102,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1200, 630)

  ctx.strokeStyle = 'rgba(255,255,255,.12)'
  ctx.strokeRect(34, 34, 1132, 562)

  ctx.fillStyle = '#b9ff66'
  ctx.font = '600 21px system-ui, sans-serif'
  ctx.fillText('THE INTELLIGENCE CURVE', 72, 86)

  ctx.fillStyle = '#8c949d'
  ctx.font = '500 18px ui-monospace, monospace'
  ctx.fillText('STATE OF AI PROGRESS', 72, 122)

  ctx.fillStyle = report.status === 'final' ? 'rgba(185,255,102,.12)' : 'rgba(245,210,122,.12)'
  ctx.strokeStyle = report.status === 'final' ? 'rgba(185,255,102,.45)' : 'rgba(245,210,122,.45)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(900, 72, 210, 42, 21)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = report.status === 'final' ? '#b9ff66' : '#f5d27a'
  ctx.font = '700 15px ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.fillText(formatStatus(report), 1005, 99)
  ctx.textAlign = 'left'

  ctx.fillStyle = '#f3f5f4'
  ctx.font = '650 62px system-ui, sans-serif'
  ctx.fillText(report.period, 72, 205)

  ctx.fillStyle = '#aab2ba'
  ctx.font = '400 21px system-ui, sans-serif'
  wrapText(ctx, report.takeaway, 72, 250, 1040, 30, 3)

  ctx.strokeStyle = 'rgba(255,255,255,.10)'
  ctx.beginPath()
  ctx.moveTo(72, 350)
  ctx.lineTo(1128, 350)
  ctx.stroke()

  ctx.fillStyle = '#8c949d'
  ctx.font = '600 16px ui-monospace, monospace'
  ctx.fillText('BIGGEST ACCEPTED MOVEMENTS', 72, 390)

  const columnWidth = 320
  const gap = 32

  events.forEach((event, index) => {
    const x = 72 + index * (columnWidth + gap)

    ctx.fillStyle = '#b9ff66'
    ctx.font = '650 22px ui-monospace, monospace'
    const change = event.changeLabel ?? event.category
    wrapText(ctx, change, x, 430, columnWidth, 28, 2)

    ctx.fillStyle = '#f3f5f4'
    ctx.font = '600 19px system-ui, sans-serif'
    wrapText(ctx, event.title, x, 490, columnWidth, 25, 3)

    ctx.fillStyle = '#69727b'
    ctx.font = '500 14px ui-monospace, monospace'
    ctx.fillText(event.source.toUpperCase(), x, 560)
  })

  ctx.strokeStyle = 'rgba(255,255,255,.12)'
  ctx.beginPath()
  ctx.moveTo(72, 578)
  ctx.lineTo(1128, 578)
  ctx.stroke()

  ctx.fillStyle = '#8c949d'
  ctx.font = '500 15px ui-monospace, monospace'
  ctx.fillText('OBSERVED ≠ FITTED ≠ PROJECTED', 72, 607)
  ctx.textAlign = 'right'
  ctx.fillText(`intelligencecurve.netlify.app/reports/${report.slug}`, 1128, 607)
  ctx.textAlign = 'left'

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create report card')), 'image/png')
  })
}

export default function ShareReportCard({ report, compact = false }: { report: MonthlyReport; compact?: boolean }) {
  const [status, setStatus] = useState('')

  const copyLink = async () => {
    const url = `${window.location.origin}/reports/${report.slug}`
    await navigator.clipboard.writeText(url)
    setStatus('Link copied')
    window.setTimeout(() => setStatus(''), 1800)
  }

  const shareCard = async () => {
    try {
      setStatus('Creating card…')
      const blob = await createReportCard(report)
      const file = new File([blob], `${report.slug}-state-of-ai-progress.png`, { type: 'image/png' })
      const url = `${window.location.origin}/reports/${report.slug}`
      const shareData = {
        files: [file],
        title: report.title,
        text: `${report.title} — The Intelligence Curve`,
        url,
      }

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share(shareData)
        setStatus('Shared')
      } else {
        const objectUrl = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = objectUrl
        anchor.download = file.name
        anchor.click()
        URL.revokeObjectURL(objectUrl)
        setStatus('PNG saved')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus('')
        return
      }
      setStatus('Could not create card')
    }
    window.setTimeout(() => setStatus(''), 2200)
  }

  return (
    <div className={`share-report-actions${compact ? ' share-report-actions-compact' : ''}`}>
      <button type="button" className="button primary share-button" onClick={shareCard}>Share report card ↗</button>
      <button type="button" className="button secondary share-button" onClick={copyLink}>Copy link</button>
      <span className="share-status" aria-live="polite">{status}</span>
    </div>
  )
}
