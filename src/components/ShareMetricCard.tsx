import { useState } from 'react'
import type { Metric } from '../data/metrics'
import type { MetricDetail } from '../data/metricDetails'

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 4) {
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

function drawSeries(ctx: CanvasRenderingContext2D, detail: MetricDetail, x: number, y: number, width: number, height: number) {
  const series = detail.series
  if (!series || series.length < 2) return

  const values = series.map((point) => point.value)
  const transformed = detail.seriesScale === 'log'
    ? values.map((value) => Math.log10(Math.max(value, 0.0001)))
    : values
  const min = Math.min(...transformed)
  const max = Math.max(...transformed)
  const range = max - min || 1

  ctx.strokeStyle = 'rgba(255,255,255,.12)'
  ctx.lineWidth = 1
  for (let i = 0; i < 4; i += 1) {
    const gy = y + (height / 3) * i
    ctx.beginPath()
    ctx.moveTo(x, gy)
    ctx.lineTo(x + width, gy)
    ctx.stroke()
  }

  ctx.strokeStyle = '#b9ff66'
  ctx.lineWidth = 5
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()

  transformed.forEach((value, index) => {
    const px = x + (index / (transformed.length - 1)) * width
    const py = y + height - ((value - min) / range) * height
    if (index === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  })
  ctx.stroke()

  transformed.forEach((value, index) => {
    const px = x + (index / (transformed.length - 1)) * width
    const py = y + height - ((value - min) / range) * height
    ctx.fillStyle = '#b9ff66'
    ctx.beginPath()
    ctx.arc(px, py, 5, 0, Math.PI * 2)
    ctx.fill()
  })
}

async function createCard(metric: Metric, detail: MetricDetail) {
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

  const glow = ctx.createRadialGradient(1010, 30, 0, 1010, 30, 430)
  glow.addColorStop(0, 'rgba(185,255,102,.16)')
  glow.addColorStop(1, 'rgba(185,255,102,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1200, 630)

  ctx.strokeStyle = 'rgba(255,255,255,.12)'
  ctx.strokeRect(34, 34, 1132, 562)

  ctx.fillStyle = '#b9ff66'
  ctx.font = '600 21px system-ui, sans-serif'
  ctx.fillText('THE INTELLIGENCE CURVE', 72, 88)

  ctx.fillStyle = '#8c949d'
  ctx.font = '500 18px ui-monospace, monospace'
  ctx.fillText(`${metric.category.toUpperCase()} · ${metric.evidenceKind === 'trend-fit' ? 'HISTORICAL TREND FIT' : 'OBSERVED RESULT'}`, 72, 128)

  ctx.fillStyle = '#f3f5f4'
  ctx.font = '600 39px system-ui, sans-serif'
  wrapText(ctx, metric.label, 72, 196, 620, 47, 2)

  ctx.fillStyle = '#b9ff66'
  ctx.font = '600 74px system-ui, sans-serif'
  ctx.fillText(metric.headline, 72, 328)

  ctx.fillStyle = '#b9bec4'
  ctx.font = '500 21px ui-monospace, monospace'
  wrapText(ctx, metric.secondary, 72, 368, 590, 29, 2)

  if (detail.series && detail.series.length > 1) {
    drawSeries(ctx, detail, 730, 180, 380, 235)
    ctx.fillStyle = '#8c949d'
    ctx.font = '500 16px ui-monospace, monospace'
    ctx.fillText(detail.seriesLabel ?? 'Historical series', 730, 452)
    ctx.fillText(detail.seriesScale === 'log' ? 'LOG SCALE' : 'LINEAR SCALE', 730, 480)
  } else {
    ctx.fillStyle = 'rgba(255,255,255,.035)'
    ctx.fillRect(730, 180, 380, 235)
    ctx.fillStyle = '#8c949d'
    ctx.font = '500 18px ui-monospace, monospace'
    ctx.fillText('SOURCE-BACKED HEADLINE METRIC', 762, 286)
    ctx.fillText('FULL SERIES NOT YET INGESTED', 762, 320)
  }

  ctx.fillStyle = '#8c949d'
  ctx.font = '400 18px system-ui, sans-serif'
  wrapText(ctx, detail.interpretation, 72, 448, 610, 27, 3)

  ctx.strokeStyle = 'rgba(255,255,255,.12)'
  ctx.beginPath()
  ctx.moveTo(72, 536)
  ctx.lineTo(1128, 536)
  ctx.stroke()

  ctx.fillStyle = '#f3f5f4'
  ctx.font = '600 17px ui-monospace, monospace'
  ctx.fillText(metric.source, 72, 572)
  ctx.fillStyle = '#69727b'
  ctx.font = '500 16px ui-monospace, monospace'
  ctx.textAlign = 'right'
  ctx.fillText(`AS OF ${metric.asOf} · intelligencecurve.netlify.app`, 1128, 572)
  ctx.textAlign = 'left'

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create share image')), 'image/png')
  })
}

export default function ShareMetricCard({ metric, detail }: { metric: Metric; detail: MetricDetail }) {
  const [status, setStatus] = useState<string>('')

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setStatus('Link copied')
    window.setTimeout(() => setStatus(''), 1800)
  }

  const shareCard = async () => {
    try {
      setStatus('Creating card…')
      const blob = await createCard(metric, detail)
      const file = new File([blob], `${metric.id}-intelligence-curve.png`, { type: 'image/png' })
      const shareData = { files: [file], title: metric.label, text: `${metric.label}: ${metric.headline} — The Intelligence Curve`, url: window.location.href }

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share(shareData)
        setStatus('Shared')
      } else {
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = file.name
        anchor.click()
        URL.revokeObjectURL(url)
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
    <div className="share-metric-actions">
      <button type="button" className="button primary share-button" onClick={shareCard}>Share chart card ↗</button>
      <button type="button" className="button secondary share-button" onClick={copyLink}>Copy link</button>
      <span className="share-status" aria-live="polite">{status}</span>
    </div>
  )
}
