import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import SEO from './SEO'

const links = [
  ['Trends', '/trends'],
  ['AI Velocity', '/velocity'],
  ['Then vs Now', '/then-vs-now'],
  ['Benchmarks', '/benchmarks'],
  ['Agents', '/agents'],
  ['Scaling', '/scaling'],
  ['Methodology', '/methodology'],
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = (mobile = false) => links.map(([label, path]) => (
    <NavLink
      key={path}
      to={path}
      onClick={() => mobile && setMenuOpen(false)}
      className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
    >
      {label}
    </NavLink>
  ))

  return (
    <div className="site-shell">
      <SEO />
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="The Intelligence Curve home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">↗</span>
          <span>The Intelligence Curve</span>
        </NavLink>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks()}
        </nav>

        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
          <span aria-hidden="true">{menuOpen ? '×' : '＋'}</span>
        </button>

        {menuOpen && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
            {navLinks(true)}
          </nav>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="site-footer">
        <div>
          <strong>The Intelligence Curve</strong>
          <p>Tracking the pace of AI progress without pretending a trend line is destiny.</p>
        </div>
        <div className="footer-meta">Source-first · Evidence-labelled · Frontier AI</div>
      </footer>
    </div>
  )
}
