import { NavLink, Outlet } from 'react-router-dom'

const links = [
  ['Trends', '/trends'],
  ['Benchmarks', '/benchmarks'],
  ['Agents', '/agents'],
  ['Scaling', '/scaling'],
  ['Timeline', '/timeline'],
  ['Methodology', '/methodology'],
]

export default function Layout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="The Intelligence Curve home">
          <span className="brand-mark" aria-hidden="true">↗</span>
          <span>The Intelligence Curve</span>
        </NavLink>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([label, path]) => (
            <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div>
          <strong>The Intelligence Curve</strong>
          <p>Tracking the pace of AI progress without pretending a trend line is destiny.</p>
        </div>
        <div className="footer-meta">Source-first · Static-first · Built for Netlify</div>
      </footer>
    </div>
  )
}
