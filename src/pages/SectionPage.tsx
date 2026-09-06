import MetricCard from '../components/MetricCard'
import { metrics, type MetricCategory } from '../data/metrics'

type Props = {
  eyebrow: string
  title: string
  intro: string
  category?: MetricCategory
  notes?: string[]
}

export default function SectionPage({ eyebrow, title, intro, category, notes = [] }: Props) {
  const relevant = category ? metrics.filter((metric) => metric.category === category) : []

  return (
    <section className="section-pad page-section">
      <div className="page-hero">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>

      {relevant.length > 0 && <div className="metric-grid page-metrics">{relevant.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>}

      <div className="roadmap-panel">
        <span className="eyebrow">V1 ROADMAP</span>
        <h2>Built to grow from here</h2>
        <div className="roadmap-list">
          {notes.map((note, index) => <div key={note}><span>0{index + 1}</span><p>{note}</p></div>)}
        </div>
      </div>
    </section>
  )
}
