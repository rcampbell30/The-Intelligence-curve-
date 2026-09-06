import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="section-pad page-section report-not-found">
      <span className="eyebrow">404 · NOT FOUND</span>
      <h1>This curve doesn’t exist.</h1>
      <p className="hero-copy">The route may have moved, or the link may be incomplete. Nothing has been inferred or redirected silently.</p>
      <div className="hero-actions">
        <Link to="/" className="button primary">Back to dashboard →</Link>
        <Link to="/updates" className="button secondary">Latest updates</Link>
      </div>
    </section>
  )
}
