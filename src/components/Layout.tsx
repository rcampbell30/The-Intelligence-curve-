import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import SEO from './SEO'

const links = [
  ['Trends', '/trends'],
  ['AI Velocity', '/velocity'],
  ['Updates', '/updates'],
  ['Reports', '/reports'],
  ['Then vs Now', '/then-vs-now'],
  ['Benchmarks', '/benchmarks'],
  ['Agents', '/agents'],
  ['Scaling', '/scaling'],
  ['Methodology', '/methodology'],
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const exploreRef = useRef<HTMLDetailsElement>(null)
  const { pathname } = useLocation()
  useEffect(() => {
    setMenuOpen(false)
    if (exploreRef.current) exploreRef.current.open = false
  }, [pathname])
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!exploreRef.current?.contains(event.target as Node) && exploreRef.current) exploreRef.current.open = false
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [])

  const navLinks = (mobile = false, items = links) => items.map(([label, path]) => (
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
          {navLinks(false, links.slice(0, 4))}
          <details ref={exploreRef} className="explore-nav" onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false
              event.currentTarget.querySelector('summary')?.focus()
            }
          }}>
            <summary className={`nav-link ${links.slice(4, 8).some(([, path]) => path === pathname) ? 'active' : ''}`}>Explore <span aria-hidden="true">⌄</span></summary>
            <div className="explore-menu">{navLinks(false, links.slice(4, 8))}</div>
          </details>
          {navLinks(false, links.slice(8))}
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
