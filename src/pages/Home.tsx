import { Link } from 'react-router-dom'
import EvidenceDashboard from '../components/EvidenceDashboard'
import GrowthChart from '../components/GrowthChart'
import MetricCard from '../components/MetricCard'
import { categories, metrics } from '../data/metrics'

export default function Home() {
  return (
    <>
      <section className="hero section-pad">
        <div className="hero-kicker"><span className="live-dot" /> TRACKING FRONTIER AI</div>
        <h1>How fast is intelligence<br />actually <em>improving?</em></h1>
        <p className="hero-copy">A source-first view of the curves behind AI progress — capability, autonomous work, compute, efficiency and the infrastructure underneath it.</p>
        <div className="hero-actions">
          <Link to="/trends" className="button primary">Explore the trends <span>→</span></Link>
          <Link to="/methodology" className="button secondary">How we measure</Link>
        </div>
        <div className="hero-rule">
          <span>Updated 6 Sep 2026</span><span>{metrics.length} headline indicators</span><span>Observed ≠ fitted ≠ projected</span>
        </div>
      </section>

      <section className="section-pad block-section">
        <div className="section-heading">
          <div><span className="eyebrow">SIGNALS RIGHT NOW</span><h2>{metrics.length} curves worth watching</h2></div>
          <p>Every headline number keeps its source, date and methodological caveat attached. No single metric is presented as an “AGI score”.</p>
        </div>
        <div className="metric-grid">{metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</div>
      </section>

      <EvidenceDashboard />

      <section className="section-pad block-section"><GrowthChart /></section>

      <section className="section-pad block-section">
        <div className="section-heading">
          <div><span className="eyebrow">EXPLORE</span><h2>One dashboard, several views</h2></div>
          <p>The site is structured so new datasets can slot into the right view without redesigning the whole thing.</p>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link to={category.path} className="category-card" key={category.path}>
              <span className="category-number">0{index + 1}</span>
              <span className="eyebrow">{category.eyebrow}</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="category-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-pad manifesto">
        <span className="eyebrow">THE RULE</span>
        <h2>Fast progress deserves<br /><em>slow, careful measurement.</em></h2>
        <p>The Intelligence Curve is designed to make extraordinary trends legible without turning extrapolations into prophecy.</p>
        <Link to="/methodology" className="text-link">Read the methodology →</Link>
      </section>
    </>
  )
}
