import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { label: 'Home',     path: '/' },
  { label: 'Movies',   path: '/movies' },
  { label: 'Theaters', path: '/theaters' },
  { label: 'Blogs',    path: '/blogs' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 32px', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--red)', letterSpacing: '3px' }}>
        CINEMAX
      </Link>

      <ul style={{ display: 'flex', gap: '36px', listStyle: 'none', alignItems: 'center' }}>
        {links.map(l => (
          <li key={l.path}>
            <Link to={l.path} style={{
              fontSize: '13px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase',
              color: pathname === l.path ? 'var(--red)' : 'var(--muted)',
              transition: 'color 0.2s', position: 'relative',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = pathname === l.path ? 'var(--red)' : 'var(--muted)'}
            >
              {l.label}
              {pathname === l.path && (
                <span style={{
                  position: 'absolute', bottom: '-4px', left: 0, right: 0,
                  height: '2px', background: 'var(--red)', borderRadius: '2px'
                }} />
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <input placeholder="Search movies..." style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '7px 14px 7px 36px',
            color: 'var(--text)', fontSize: '13px', width: '180px', outline: 'none',
          }}
            onFocus={e => e.target.style.borderColor = 'var(--red)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '14px' }}>🔍</span>
        </div>
        <Link to="/login" style={{
          background: 'var(--red)', color: '#fff', padding: '8px 20px',
          borderRadius: '20px', fontSize: '13px', fontWeight: 600,
        }}>Sign In</Link>
      </div>
    </nav>
  )
}