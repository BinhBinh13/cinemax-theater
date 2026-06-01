import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../../components/Navbar.jsx'
import Footer from '../../../components/Footer.jsx'
import MovieCard from '../components/MovieCard.jsx'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockHero = {
  id: 1,
  title: 'AVENGERS: DOOMSDAY',
  tagline: 'The End of Everything',
  description: 'The greatest battle in Marvel history unfolds as Earth\'s mightiest heroes face their ultimate reckoning.',
  rating: 9.2,
  genres: ['Action', 'Sci-Fi'],
  duration: '2h 45m',
  year: 2025,
  poster: 'https://placehold.co/1920x1080/0d0005/e63329?text=',
}

const mockMovies = {
  hottest: [
    { id: 1, title: 'Avengers: Doomsday', genre: 'Action', genres: ['Action', 'Sci-Fi'], rating: 9.2, poster: 'https://placehold.co/300x450/1a0005/cc2200?text=AVG' },
    { id: 2, title: 'Mission Impossible 8', genre: 'Thriller', genres: ['Thriller', 'Action'], rating: 8.8, poster: 'https://placehold.co/300x450/001a10/00cc66?text=MI8' },
    { id: 3, title: 'Inside Out 3', genre: 'Animation', genres: ['Animation', 'Family'], rating: 8.5, poster: 'https://placehold.co/300x450/0a0a1a/4466ff?text=IO3' },
    { id: 4, title: 'Dune: Awakening', genre: 'Sci-Fi', genres: ['Sci-Fi', 'Drama'], rating: 8.9, poster: 'https://placehold.co/300x450/1a1200/cc9900?text=DUNE' },
    { id: 5, title: 'The Dark Knight 2', genre: 'Action', genres: ['Action', 'Crime'], rating: 9.0, poster: 'https://placehold.co/300x450/050505/777777?text=DK2' },
  ],
  nowShowing: [
    { id: 1, title: 'Avengers: Doomsday', genre: 'Action', genres: ['Action', 'Sci-Fi'], rating: 9.2, poster: 'https://placehold.co/300x450/1a0005/cc2200?text=AVG' },
    { id: 2, title: 'Mission Impossible 8', genre: 'Thriller', genres: ['Thriller', 'Action'], rating: 8.8, poster: 'https://placehold.co/300x450/001a10/00cc66?text=MI8' },
    { id: 3, title: 'Inside Out 3', genre: 'Animation', genres: ['Animation', 'Family'], rating: 8.5, poster: 'https://placehold.co/300x450/0a0a1a/4466ff?text=IO3' },
    { id: 4, title: 'Dune: Awakening', genre: 'Sci-Fi', genres: ['Sci-Fi', 'Drama'], rating: 8.9, poster: 'https://placehold.co/300x450/1a1200/cc9900?text=DUNE' },
    { id: 5, title: 'The Dark Knight 2', genre: 'Action', genres: ['Action', 'Crime'], rating: 9.0, poster: 'https://placehold.co/300x450/050505/777777?text=DK2' },
    { id: 6, title: 'Oppenheimer II', genre: 'Drama', genres: ['Drama', 'History'], rating: 8.7, poster: 'https://placehold.co/300x450/100a00/ff6600?text=OPP' },
  ],
  comingSoon: [
    { id: 7, title: 'Spider-Man 4', genre: 'Action', genres: ['Action', 'Superhero'], rating: null, comingSoon: true, releaseDate: 'July 2025', poster: 'https://placehold.co/300x450/0a001a/cc0088?text=SM4' },
    { id: 8, title: 'Fast & Furious 11', genre: 'Action', genres: ['Action', 'Racing'], rating: null, comingSoon: true, releaseDate: 'Aug 2025', poster: 'https://placehold.co/300x450/1a0a00/ff4400?text=FF11' },
    { id: 9, title: 'Jurassic World 4', genre: 'Adventure', genres: ['Adventure', 'Sci-Fi'], rating: null, comingSoon: true, releaseDate: 'Sep 2025', poster: 'https://placehold.co/300x450/001a0a/009933?text=JW4' },
    { id: 10, title: 'Blade 2025', genre: 'Action', genres: ['Action', 'Horror'], rating: null, comingSoon: true, releaseDate: 'Oct 2025', poster: 'https://placehold.co/300x450/0d0000/990000?text=BLD' },
  ],
}

const theaters = [
  { id: 'all', name: 'All Theaters' },
  { id: 't1', name: 'Cinemax Hà Nội' },
  { id: 't2', name: 'Cinemax Hồ Chí Minh' },
  { id: 't3', name: 'Cinemax Đà Nẵng' },
]

const mockBookingMovies = [
  { id: 1, title: 'Avengers: Doomsday', genres: ['Action', 'Sci-Fi'], rating: 9.2, poster: 'https://placehold.co/300x450/1a0005/cc2200?text=AVG', showtimes: ['09:00', '11:30', '14:00', '16:30', '19:00', '21:30'] },
  { id: 2, title: 'Mission Impossible 8', genres: ['Thriller', 'Action'], rating: 8.8, poster: 'https://placehold.co/300x450/001a10/00cc66?text=MI8', showtimes: ['10:00', '13:00', '16:00', '19:30'] },
  { id: 3, title: 'Inside Out 3', genres: ['Animation', 'Family'], rating: 8.5, poster: 'https://placehold.co/300x450/0a0a1a/4466ff?text=IO3', showtimes: ['09:30', '12:00', '14:30', '17:00'] },
]

const mockComments = [
  { id: 1, user: 'Minh Nguyễn', avatar: 'MN', movie: 'Avengers: Doomsday', rating: 5, text: 'Bộ phim đỉnh nhất năm 2025! Hiệu ứng hình ảnh tuyệt vời, cốt truyện cuốn hút từ đầu đến cuối.', time: '2 days ago' },
  { id: 2, user: 'Thu Hương', avatar: 'TH', movie: 'Inside Out 3', rating: 5, text: 'Xúc động vô cùng! Pixar lại một lần nữa chứng minh họ là bậc thầy của cảm xúc.', time: '3 days ago' },
  { id: 3, user: 'Đức Anh', avatar: 'ĐA', movie: 'Mission Impossible 8', rating: 4, text: 'Tom Cruise vẫn không ngừng vượt qua giới hạn của bản thân. Phim hành động xuất sắc!', time: '5 days ago' },
  { id: 4, user: 'Lan Phương', avatar: 'LP', movie: 'Dune: Awakening', rating: 5, text: 'Thế giới Dune được khắc họa hoàn hảo. Đây là tác phẩm nghệ thuật điện ảnh thực sự.', time: '1 week ago' },
  { id: 5, user: 'Hoàng Nam', avatar: 'HN', movie: 'The Dark Knight 2', rating: 5, text: 'Không thể tin được! Phim còn hay hơn cả phần trước. Đây là siêu anh hùng chân thực nhất.', time: '1 week ago' },
  { id: 6, user: 'Mai Chi', avatar: 'MC', movie: 'Avengers: Doomsday', rating: 4, text: 'Kết thúc bất ngờ hoàn toàn. Đội ngũ làm phim đã làm tốt lắm với thử thách khổng lồ này.', time: '2 weeks ago' },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function MovieRow({ title, accent, movies, showViewAll = true }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 600, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ marginBottom: '64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {accent && (
            <div style={{ width: '4px', height: '28px', background: 'var(--red)', borderRadius: '2px' }} />
          )}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px', color: 'var(--text)' }}>
            {title}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => scroll(-1)} style={{
            width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--muted)', fontSize: '16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >‹</button>
          <button onClick={() => scroll(1)} style={{
            width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--muted)', fontSize: '16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >›</button>
          {showViewAll && (
            <Link to="/movies" style={{
              fontSize: '13px', color: 'var(--red)', fontWeight: 600, letterSpacing: '0.5px',
              padding: '6px 16px', border: '1px solid var(--red)', borderRadius: '20px',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--red)' }}
            >
              View All
            </Link>
          )}
        </div>
      </div>

      {/* Scroll row */}
      <div ref={scrollRef} style={{
        display: 'flex', gap: '16px', overflowX: 'auto',
        paddingBottom: '12px', scrollbarWidth: 'none',
      }}>
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} size="md" />
        ))}
      </div>
    </div>
  )
}

function BookingSection() {
  const [theater, setTheater] = useState('all')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [roomType, setRoomType] = useState('single')
  const [selectedMovie, setSelectedMovie] = useState(null)

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      value: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }),
    }
  })

  return (
    <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '56px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ color: 'var(--red)', fontSize: '12px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Quick Booking</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '2px' }}>BOOK MOVIE TICKETS</h2>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Theater */}
          <select value={theater} onChange={e => setTheater(e.target.value)} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px',
            color: 'var(--text)', padding: '10px 16px', fontSize: '14px', outline: 'none', cursor: 'pointer',
          }}>
            {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Room type */}
          <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            {['single', 'couple'].map(type => (
              <button key={type} onClick={() => setRoomType(type)} style={{
                padding: '10px 20px', fontSize: '14px', cursor: 'pointer', border: 'none', outline: 'none',
                background: roomType === type ? 'var(--red)' : 'transparent',
                color: roomType === type ? '#fff' : 'var(--muted)',
                fontFamily: 'var(--font-body)', textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}>
                {type === 'single' ? '🪑 Single' : '💑 Couple'}
              </button>
            ))}
          </div>

          {/* Date tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1 }}>
            {dates.map(d => (
              <button key={d.value} onClick={() => setDate(d.value)} style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                background: date === d.value ? 'var(--red)' : 'var(--surface2)',
                color: date === d.value ? '#fff' : 'var(--muted)',
                fontFamily: 'var(--font-body)', fontWeight: date === d.value ? 600 : 400,
                transition: 'all 0.2s',
              }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Movie + Showtimes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mockBookingMovies.map(movie => (
            <div key={movie.id} style={{
              display: 'flex', gap: '20px', alignItems: 'center',
              background: 'var(--surface2)', borderRadius: '12px', padding: '16px 20px',
              border: selectedMovie === movie.id ? '1px solid var(--red)' : '1px solid transparent',
              transition: 'border-color 0.2s', cursor: 'pointer',
            }} onClick={() => setSelectedMovie(selectedMovie === movie.id ? null : movie.id)}>
              {/* Poster */}
              <img src={movie.poster} alt={movie.title} style={{ width: '52px', height: '72px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>{movie.title}</span>
                  <span style={{ fontSize: '12px', color: 'var(--gold)' }}>★ {movie.rating}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {movie.genres.map(g => (
                    <span key={g} style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--surface)', borderRadius: '4px', padding: '2px 8px' }}>{g}</span>
                  ))}
                </div>
              </div>
              {/* Showtimes */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {movie.showtimes.map(time => (
                  <Link key={time} to={`/booking/${movie.id}`} onClick={e => e.stopPropagation()} style={{
                    padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
                  >
                    {time}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CommentsSection() {
  const [visibleCount, setVisibleCount] = useState(3)

  return (
    <section style={{ padding: '72px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ color: 'var(--red)', fontSize: '12px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Community</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '2px' }}>FEATURED REVIEWS</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {mockComments.slice(0, visibleCount).map(c => (
            <div key={c.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px', position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', background: 'var(--red)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>{c.avatar}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{c.user}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{c.movie} · {c.time}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                  {Array(5).fill(0).map((_, i) => (
                    <span key={i} style={{ fontSize: '12px', color: i < c.rating ? 'var(--gold)' : 'var(--border)' }}>★</span>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', fontStyle: 'italic' }}>"{c.text}"</p>
            </div>
          ))}
        </div>

        {visibleCount < mockComments.length && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setVisibleCount(mockComments.length)} style={{
              background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)',
              padding: '12px 36px', borderRadius: '24px', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
            >
              Load More Reviews
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Main HomePage ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [heroCurrent, setHeroCurrent] = useState(0)
  const heroMovies = [mockHero, { ...mockHero, id: 2, title: 'MISSION: IMPOSSIBLE 8', tagline: 'No Mission Too Big', description: 'Ethan Hunt faces his most impossible mission yet in a race against time to save the world.' }]

  // Auto rotate hero
  useEffect(() => {
    const timer = setInterval(() => setHeroCurrent(c => (c + 1) % heroMovies.length), 7000)
    return () => clearInterval(timer)
  }, [])

  const hero = heroMovies[heroCurrent]

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', height: '100svh', minHeight: '640px',
        display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
      }}>
        {/* BG */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 30% 60%, rgba(230,51,41,0.15) 0%, transparent 60%),
                       linear-gradient(135deg, #0d0005 0%, #050010 50%, #000a00 100%)`,
          transition: 'all 1s',
        }} />

        {/* Grain texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        {/* Film strip decoration */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%',
          background: 'linear-gradient(to left, rgba(0,0,0,0.7), transparent)',
          zIndex: 1,
        }}>
          <img
            src={`https://placehold.co/800x1000/1a0005/330000?text=${encodeURIComponent(hero.title)}`}
            alt={hero.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
          />
        </div>

        {/* Gradient overlay bottom */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(to top, var(--bg) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '1200px', margin: '0 auto', padding: '0 32px 80px', width: '100%' }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{
                background: 'var(--red)', color: '#fff', fontSize: '10px', fontWeight: 700,
                letterSpacing: '2px', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase',
              }}>Now Showing</span>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                ★ {hero.rating} &nbsp;·&nbsp; {hero.duration} &nbsp;·&nbsp; {hero.year}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 7vw, 84px)',
              letterSpacing: '3px', lineHeight: '0.95', marginBottom: '8px',
              color: '#fff',
            }}>
              {hero.title}
            </h1>
            <p style={{ color: 'var(--red)', fontSize: '16px', letterSpacing: '2px', marginBottom: '16px', fontWeight: 300 }}>
              {hero.tagline}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px', maxWidth: '460px' }}>
              {hero.description}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to={`/movies/${hero.id}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--red)', color: '#fff',
                padding: '14px 32px', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
                letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🎬 Book Now
              </Link>
              <Link to={`/movies/${hero.id}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.08)', color: '#fff',
                padding: '14px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                ▷ Watch Trailer
              </Link>
            </div>
          </div>
        </div>

        {/* Hero dots */}
        <div style={{ position: 'absolute', bottom: '32px', right: '48px', zIndex: 4, display: 'flex', gap: '8px' }}>
          {heroMovies.map((_, i) => (
            <button key={i} onClick={() => setHeroCurrent(i)} style={{
              width: i === heroCurrent ? '24px' : '8px', height: '8px', borderRadius: '4px',
              background: i === heroCurrent ? 'var(--red)' : 'rgba(255,255,255,0.3)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '72px 32px 0', width: '100%' }}>
        <MovieRow title="🔥 THE HOTTEST" accent movies={mockMovies.hottest} />
        <MovieRow title="NOW SHOWING" accent movies={mockMovies.nowShowing} />
        <MovieRow title="COMING SOON" accent movies={mockMovies.comingSoon} />
      </main>

      {/* ── Booking Section ──────────────────────────────────────────────── */}
      <BookingSection />

      {/* ── Comments Section ─────────────────────────────────────────────── */}
      <CommentsSection />

      <Footer />
    </div>
  )
}
