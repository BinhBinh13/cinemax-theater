import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../../components/Navbar.jsx'
import Footer from '../../../components/Footer.jsx'
import MovieCard from '../components/MovieCard.jsx'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const allMovies = [
  { id: 1,  title: 'Avengers: Doomsday',     genres: ['Action', 'Sci-Fi'],        rating: 9.2, duration: '2h 45m', poster: 'https://placehold.co/300x450/1a0005/cc2200?text=AVG',  status: 'showing' },
  { id: 2,  title: 'Mission Impossible 8',    genres: ['Thriller', 'Action'],      rating: 8.8, duration: '2h 30m', poster: 'https://placehold.co/300x450/001a10/00cc66?text=MI8',  status: 'showing' },
  { id: 3,  title: 'Inside Out 3',            genres: ['Animation', 'Family'],     rating: 8.5, duration: '1h 50m', poster: 'https://placehold.co/300x450/0a0a1a/4466ff?text=IO3',  status: 'showing' },
  { id: 4,  title: 'Dune: Awakening',         genres: ['Sci-Fi', 'Drama'],         rating: 8.9, duration: '2h 55m', poster: 'https://placehold.co/300x450/1a1200/cc9900?text=DUNE', status: 'showing' },
  { id: 5,  title: 'The Dark Knight 2',       genres: ['Action', 'Crime'],         rating: 9.0, duration: '2h 40m', poster: 'https://placehold.co/300x450/050505/777777?text=DK2',  status: 'showing' },
  { id: 6,  title: 'Oppenheimer II',          genres: ['Drama', 'History'],        rating: 8.7, duration: '3h 05m', poster: 'https://placehold.co/300x450/100a00/ff6600?text=OPP',  status: 'showing' },
  { id: 7,  title: 'Spider-Man 4',            genres: ['Action', 'Superhero'],     rating: null,duration: '2h 10m', poster: 'https://placehold.co/300x450/0a001a/cc0088?text=SM4',  status: 'coming', comingSoon: true, releaseDate: 'Jul 2025' },
  { id: 8,  title: 'Fast & Furious 11',       genres: ['Action', 'Racing'],        rating: null,duration: '2h 05m', poster: 'https://placehold.co/300x450/1a0a00/ff4400?text=FF11', status: 'coming', comingSoon: true, releaseDate: 'Aug 2025' },
  { id: 9,  title: 'Jurassic World 4',        genres: ['Adventure', 'Sci-Fi'],     rating: null,duration: '2h 20m', poster: 'https://placehold.co/300x450/001a0a/009933?text=JW4',  status: 'coming', comingSoon: true, releaseDate: 'Sep 2025' },
  { id: 10, title: 'Blade 2025',              genres: ['Action', 'Horror'],        rating: null,duration: '2h 00m', poster: 'https://placehold.co/300x450/0d0000/990000?text=BLD',  status: 'coming', comingSoon: true, releaseDate: 'Oct 2025' },
  { id: 11, title: 'The Notebook 2',          genres: ['Romance', 'Drama'],        rating: 7.9, duration: '1h 55m', poster: 'https://placehold.co/300x450/0a0005/cc6699?text=NB2',  status: 'showing' },
  { id: 12, title: 'Alien: Romulus',          genres: ['Horror', 'Sci-Fi'],        rating: 8.1, duration: '1h 59m', poster: 'https://placehold.co/300x450/050a00/44aa00?text=ALN',  status: 'showing' },
  { id: 13, title: 'Kung Fu Panda 5',         genres: ['Animation', 'Comedy'],     rating: 8.3, duration: '1h 45m', poster: 'https://placehold.co/300x450/0d0800/ffaa00?text=KFP',  status: 'showing' },
  { id: 14, title: 'John Wick 5',             genres: ['Action', 'Crime'],         rating: 8.6, duration: '2h 15m', poster: 'https://placehold.co/300x450/000000/aaaaaa?text=JW5',  status: 'showing' },
  { id: 15, title: 'Moana 2',                 genres: ['Animation', 'Adventure'],  rating: 8.0, duration: '1h 40m', poster: 'https://placehold.co/300x450/001520/0099cc?text=MOA',  status: 'showing' },
  { id: 16, title: 'Interstellar 2',          genres: ['Sci-Fi', 'Drama'],         rating: null,duration: '3h 00m', poster: 'https://placehold.co/300x450/000510/003366?text=INT2', status: 'coming', comingSoon: true, releaseDate: 'Nov 2025' },
]

const allGenres = ['Action', 'Sci-Fi', 'Drama', 'Animation', 'Thriller', 'Comedy', 'Horror', 'Adventure', 'Romance', 'Crime', 'Family', 'History', 'Superhero', 'Racing']

const theaters = [
  { id: 'all',  name: 'All Theaters' },
  { id: 't1',   name: 'Cinemax Hà Nội' },
  { id: 't2',   name: 'Cinemax Hồ Chí Minh' },
  { id: 't3',   name: 'Cinemax Đà Nẵng' },
  { id: 't4',   name: 'Cinemax Huế' },
]

const sortOptions = [
  { value: 'default',  label: 'Default' },
  { value: 'rating',   label: 'Highest Rated' },
  { value: 'title',    label: 'Title A–Z' },
  { value: 'newest',   label: 'Newest' },
]

const ITEMS_PER_PAGE = 12

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MovieListPage() {
  const [search, setSearch]         = useState('')
  const [selectedGenres, setSelectedGenres] = useState([])
  const [theater, setTheater]       = useState('all')
  const [sortBy, setSortBy]         = useState('default')
  const [page, setPage]             = useState(1)

  // Highest rated for banner
  const bannerMovie = allMovies.reduce((best, m) => m.rating > (best.rating || 0) ? m : best, allMovies[0])

  // Toggle genre filter
  const toggleGenre = (g) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
    setPage(1)
  }

  // Filtered + sorted movies
  const filtered = useMemo(() => {
    let list = [...allMovies]
    if (search.trim()) {
      list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    }
    if (selectedGenres.length > 0) {
      list = list.filter(m => selectedGenres.every(g => m.genres.includes(g)))
    }
    // theater filter would normally hit API
    switch (sortBy) {
      case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break
      case 'title':  list.sort((a, b) => a.title.localeCompare(b.title));    break
      default: break
    }
    return list
  }, [search, selectedGenres, theater, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handlePageChange = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', height: '380px', overflow: 'hidden',
        display: 'flex', alignItems: 'flex-end',
      }}>
        {/* BG gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0d0005 0%, #05000d 60%, #000a05 100%)',
        }} />
        {/* Poster blur bg */}
        <img
          src={bannerMovie.poster}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, filter: 'blur(24px)', transform: 'scale(1.1)' }}
        />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg) 0%, transparent 60%)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '0 32px 40px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
            <img src={bannerMovie.poster} alt={bannerMovie.title} style={{ width: '80px', height: '112px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)', flexShrink: 0 }} />
            <div>
              <p style={{ color: 'var(--red)', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', marginBottom: '6px' }}>HIGHEST RATED</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 56px)', letterSpacing: '2px', color: '#fff', marginBottom: '8px' }}>
                {bannerMovie.title}
              </h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'var(--gold)', fontSize: '14px' }}>★ {bannerMovie.rating}</span>
                <span style={{ color: 'var(--border)' }}>|</span>
                {bannerMovie.genres.slice(0, 2).map(g => (
                  <span key={g} style={{ fontSize: '12px', color: 'var(--muted)', background: 'var(--surface2)', padding: '2px 10px', borderRadius: '4px' }}>{g}</span>
                ))}
                <span style={{ color: 'var(--border)' }}>|</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{bannerMovie.duration}</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Link to={`/movies/${bannerMovie.id}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--red)', color: '#fff', padding: '12px 24px',
                borderRadius: '8px', fontSize: '13px', fontWeight: 700, letterSpacing: '1px',
              }}>
                🎬 Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: '64px', zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 32px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '0 0 240px' }}>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search movies..."
                style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '9px 14px 9px 36px', color: 'var(--text)',
                  fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--red)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '14px' }}>🔍</span>
            </div>

            {/* Theater */}
            <select value={theater} onChange={e => { setTheater(e.target.value); setPage(1) }} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text)', padding: '9px 14px',
              fontSize: '13px', outline: 'none', cursor: 'pointer',
            }}>
              {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text)', padding: '9px 14px',
              fontSize: '13px', outline: 'none', cursor: 'pointer',
            }}>
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Result count */}
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--muted)' }}>
              {filtered.length} movie{filtered.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      </div>

      {/* ── Genre Buttons ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 32px 0', width: '100%' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setSelectedGenres([]); setPage(1) }}
            style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
              background: selectedGenres.length === 0 ? 'var(--red)' : 'transparent',
              color: selectedGenres.length === 0 ? '#fff' : 'var(--muted)',
              borderColor: selectedGenres.length === 0 ? 'var(--red)' : 'var(--border)',
            }}
          >All</button>
          {allGenres.map(g => (
            <button key={g} onClick={() => toggleGenre(g)} style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
              background: selectedGenres.includes(g) ? 'var(--red)' : 'transparent',
              color: selectedGenres.includes(g) ? '#fff' : 'var(--muted)',
              borderColor: selectedGenres.includes(g) ? 'var(--red)' : 'var(--border)',
            }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* ── Movie Grid ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px 32px', width: '100%' }}>
        {paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <h3 style={{ fontSize: '20px', color: 'var(--text)', marginBottom: '8px' }}>No movies found</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Try adjusting your filters or search term.</p>
            <button onClick={() => { setSearch(''); setSelectedGenres([]); setTheater('all') }} style={{
              marginTop: '20px', padding: '10px 24px', borderRadius: '8px',
              background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)',
            }}>Clear Filters</button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '24px 16px',
          }}>
            {paginated.map(movie => (
              <MovieCard key={movie.id} movie={movie} size="md" />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '56px' }}>
            {/* Prev */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              style={{
                width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: page === 1 ? 'var(--border)' : 'var(--muted)',
                fontSize: '18px', cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
              }}
            >‹</button>

            {/* Pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
              const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1
              if (!show) {
                if (p === 2 || p === totalPages - 1) return <span key={p} style={{ color: 'var(--muted)', padding: '0 4px' }}>…</span>
                return null
              }
              return (
                <button key={p} onClick={() => handlePageChange(p)} style={{
                  width: '40px', height: '40px', borderRadius: '8px', border: '1px solid',
                  background: p === page ? 'var(--red)' : 'var(--surface)',
                  borderColor: p === page ? 'var(--red)' : 'var(--border)',
                  color: p === page ? '#fff' : 'var(--muted)',
                  fontSize: '14px', fontWeight: p === page ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                }}>
                  {p}
                </button>
              )
            })}

            {/* Next */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              style={{
                width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: page === totalPages ? 'var(--border)' : 'var(--muted)',
                fontSize: '18px', cursor: page === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
              }}
            >›</button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
