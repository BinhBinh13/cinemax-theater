import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--surface)', borderTop: '1px solid var(--border)',
      padding: '48px 32px 24px', marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--red)', letterSpacing: '3px', marginBottom: '12px' }}>CINEMAX</div>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: '1.7' }}>Your ultimate cinema experience.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text)', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Navigation</h4>
            {['Home', 'Movies', 'Theaters', 'Blogs'].map(item => (
              <Link key={item} to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                style={{ display: 'block', color: 'var(--muted)', fontSize: '13px', marginBottom: '8px' }}
              >{item}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'var(--text)', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Account</h4>
            {['Sign In', 'Register', 'My Tickets'].map(item => (
              <Link key={item} to="/login"
                style={{ display: 'block', color: 'var(--muted)', fontSize: '13px', marginBottom: '8px' }}
              >{item}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '12px' }}>© 2025 Cinemax. All rights reserved.</p>
          <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Made with ❤️ in Hanoi</p>
        </div>
      </div>
    </footer>
  )
}