import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function MovieCard({ movie, size = 'md' }) {
  const [hovered, setHovered] = useState(false)
  const sizes = {
    sm: { width: '140px', imgHeight: '200px' },
    md: { width: '180px', imgHeight: '260px' },
    lg: { width: '220px', imgHeight: '320px' },
  }
  const s = sizes[size]

  return (
    <Link to={`/movies/${movie.id}`} style={{ display: 'block', width: s.width, flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: 'relative', borderRadius: '10px', overflow: 'hidden',
        width: '100%', height: s.imgHeight,
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.3s, transform 0.3s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}>
        <img
          src={movie.poster || `https://placehold.co/300x450/111/333?text=${encodeURIComponent(movie.title)}`}
          alt={movie.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s' }}
        />
        {movie.rating && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            borderRadius: '6px', padding: '3px 8px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <span style={{ color: 'var(--gold)', fontSize: '11px' }}>★</span>
            <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>{movie.rating}</span>
          </div>
        )}
        {movie.comingSoon && (
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'var(--red)', borderRadius: '6px', padding: '3px 8px',
          }}>
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>SOON</span>
          </div>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px',
        }}>
          <div style={{
            background: 'var(--red)', color: '#fff', textAlign: 'center',
            borderRadius: '6px', padding: '8px', fontSize: '12px', fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            {movie.comingSoon ? 'Coming Soon' : 'Book Now'}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '10px', padding: '0 2px' }}>
        <p style={{
          fontSize: '14px', fontWeight: 600, color: 'var(--text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px',
        }}>{movie.title}</p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(movie.genres || [movie.genre]).slice(0, 2).map((g, i) => (
            <span key={i} style={{
              fontSize: '11px', color: 'var(--muted)',
              background: 'var(--surface2)', borderRadius: '4px', padding: '2px 6px',
            }}>{g}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}
