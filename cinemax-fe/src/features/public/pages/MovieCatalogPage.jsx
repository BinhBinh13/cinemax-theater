import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getMovies } from '@/features/staff/services/movieService'
import CustomerHeader from '@/shared/components/CustomerHeader'
import { useLanguage } from '@/app/providers/LanguageProvider'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Carousel from 'react-bootstrap/Carousel'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

const MovieCatalogPage = () => {
  const [searchParams] = useSearchParams()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('NOW_SHOWING')
  
  const { t } = useLanguage()

  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam) {
      setFilterStatus(statusParam)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies()
        setMovies(data)
      } catch (err) {
        console.error('Failed to load movies:', err)
        setError('Không thể tải danh sách phim. Vui lòng kiểm tra kết nối.')
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
    if (filterStatus === 'ALL') return matchesSearch
    if (filterStatus === 'NOW_SHOWING') {
      return (movie.status === 'NOW_SHOWING' || movie.status === 'ACTIVE') && matchesSearch
    }
    return movie.status === filterStatus && matchesSearch
  })

  return (
    <div className="cinemax-page-container d-flex flex-column">
      <CustomerHeader />

      <main className="flex-grow-1 px-3 py-4">
        <Container>
          {/* Hero Banner Carousel */}
          <div className="mb-4 rounded overflow-hidden shadow">
            <Carousel fade interval={4000} indicators controls>
              <Carousel.Item style={{ height: '360px' }}>
                <div 
                  className="w-100 h-100 d-flex align-items-center justify-content-center text-white p-5"
                  style={{
                    background: 'linear-gradient(90deg, #111111 0%, rgba(17,17,17,0.7) 50%, transparent 100%), url("/images/Inception_poster_1.jpg") center/cover no-repeat'
                  }}
                >
                  <div className="w-100" style={{ maxWidth: '600px', marginLeft: '30px' }}>
                    <Badge bg="danger" className="mb-2 px-3 py-2 uppercase fs-7">CINEMAX FEATURED</Badge>
                    <h1 className="fw-black text-uppercase text-white mb-2 fs-2" style={{ textShadow: '2px 2px 4px #000' }}>INCEPTION</h1>
                    <p className="small text-light mb-3 d-none d-md-block">Kẻ trích xuất giấc mơ - Kịch bản khoa học viễn tưởng đỉnh cao của đạo diễn Christopher Nolan.</p>
                    <Link to="/movies/1" className="cinemax-btn-ticket text-decoration-none px-4 py-2 fs-6">🎬 {t('buyTicketNow')}</Link>
                  </div>
                </div>
              </Carousel.Item>

              <Carousel.Item style={{ height: '360px' }}>
                <div 
                  className="w-100 h-100 d-flex align-items-center justify-content-center text-white p-5"
                  style={{
                    background: 'linear-gradient(90deg, #111111 0%, rgba(17,17,17,0.7) 50%, transparent 100%), url("/images/Interstellar_poster.jpg") center/cover no-repeat'
                  }}
                >
                  <div className="w-100" style={{ maxWidth: '600px', marginLeft: '30px' }}>
                    <Badge bg="warning" className="text-dark mb-2 px-3 py-2 uppercase fs-7">CINEMAX BLOCKBUSTER</Badge>
                    <h1 className="fw-black text-uppercase text-white mb-2 fs-2" style={{ textShadow: '2px 2px 4px #000' }}>INTERSTELLAR</h1>
                    <p className="small text-light mb-3 d-none d-md-block">Hố đen vũ trụ - Hành trình đi tìm hành tinh sống mới ngoài không gian đầy nghẹt thở.</p>
                    <Link to="/movies/2" className="cinemax-btn-ticket text-decoration-none px-4 py-2 fs-6">🎬 {t('buyTicketNow')}</Link>
                  </div>
                </div>
              </Carousel.Item>

              <Carousel.Item style={{ height: '360px' }}>
                <div 
                  className="w-100 h-100 d-flex align-items-center justify-content-center text-white p-5"
                  style={{
                    background: 'linear-gradient(90deg, #111111 0%, rgba(17,17,17,0.7) 50%, transparent 100%), url("/images/Avengers_Endgame_bia_teaser.jpg") center/cover no-repeat'
                  }}
                >
                  <div className="w-100" style={{ maxWidth: '600px', marginLeft: '30px' }}>
                    <Badge bg="danger" className="mb-2 px-3 py-2 uppercase fs-7">CINEMAX EXCLUSIVE</Badge>
                    <h1 className="fw-black text-uppercase text-white mb-2 fs-2" style={{ textShadow: '2px 2px 4px #000' }}>AVENGERS: ENDGAME</h1>
                    <p className="small text-light mb-3 d-none d-md-block">Trận chiến lịch sử chống lại ác nhân Thanos cứu vũ trụ.</p>
                    <Link to="/movies/3" className="cinemax-btn-ticket text-decoration-none px-4 py-2 fs-6">🎟️ {t('viewDetails')}</Link>
                  </div>
                </div>
              </Carousel.Item>
            </Carousel>
          </div>

          {/* Retro Movie Selection Header */}
          <div className="cinemax-section-title">
            <h3>{t('movieSelection')}</h3>
          </div>

          {/* Tabs & Search Controls */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-bottom border-dark border-2 pb-2 mb-4 gap-3">
            <div className="d-flex gap-3 flex-wrap">
              <button 
                className={`btn btn-link text-decoration-none fw-bold fs-5 p-0 ${filterStatus === 'NOW_SHOWING' ? 'text-danger border-bottom border-danger border-3 pb-1' : 'text-dark'}`}
                onClick={() => setFilterStatus('NOW_SHOWING')}
              >
                {t('nowShowing')} ({movies.filter(m => m.status === 'NOW_SHOWING' || m.status === 'ACTIVE').length})
              </button>
              <span className="text-secondary fs-5">|</span>
              <button 
                className={`btn btn-link text-decoration-none fw-bold fs-5 p-0 ${filterStatus === 'COMING_SOON' ? 'text-danger border-bottom border-danger border-3 pb-1' : 'text-dark'}`}
                onClick={() => setFilterStatus('COMING_SOON')}
              >
                {t('comingSoon')} ({movies.filter(m => m.status === 'COMING_SOON').length})
              </button>
              <span className="text-secondary fs-5">|</span>
              <button 
                className={`btn btn-link text-decoration-none fw-bold fs-5 p-0 ${filterStatus === 'ALL' ? 'text-danger border-bottom border-danger border-3 pb-1' : 'text-dark'}`}
                onClick={() => setFilterStatus('ALL')}
              >
                {t('allMovies')} ({movies.length})
              </button>
            </div>

            <InputGroup style={{ maxWidth: '280px' }}>
              <Form.Control
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
                className="border-dark"
              />
            </InputGroup>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" className="mb-3" />
              <div className="text-secondary fw-bold">{t('loadingMovies')}</div>
            </div>
          )}

          {error && (
            <div className="text-center py-5">
              <div className="text-danger mb-3 fw-bold">{error}</div>
            </div>
          )}

          {/* Movie Grid */}
          {!loading && !error && (
            <>
              {filteredMovies.length === 0 ? (
                <div className="text-center py-5 text-secondary fw-bold">
                  {t('noMoviesFound')}
                </div>
              ) : (
                <Row className="g-4">
                  {filteredMovies.map((movie) => (
                    <Col key={movie.id} xs={12} sm={6} md={4} lg={3}>
                      <div className="cinemax-movie-card h-100 d-flex flex-column">
                        <div className="cinemax-poster-wrapper">
                          <img
                            src={movie.poster || movie.posterUrl || `https://placehold.co/300x450/222/fff?text=${encodeURIComponent(movie.title)}`}
                            alt={movie.title}
                            className="cinemax-poster-img"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://placehold.co/300x450/222/fff?text=${encodeURIComponent(movie.title)}`;
                            }}
                          />
                          <Badge
                            bg={movie.status === 'NOW_SHOWING' || movie.status === 'ACTIVE' ? 'danger' : 'warning'}
                            className="position-absolute top-0 start-0 m-2 px-2 py-1 fs-7 shadow"
                          >
                            {movie.status === 'NOW_SHOWING' || movie.status === 'ACTIVE' ? t('nowShowing') : t('comingSoon')}
                          </Badge>

                          {/* Hover Overlay */}
                          <div className="cinemax-movie-overlay">
                            <Link 
                              to={`/movies/${movie.id}`} 
                              className="cinemax-btn-ticket text-decoration-none px-3 py-2"
                            >
                              🎟️ {t('buyTicket')}
                            </Link>
                            <Link 
                              to={`/movies/${movie.id}`} 
                              className="btn btn-sm btn-outline-light text-decoration-none px-3"
                            >
                              {t('viewDetails')}
                            </Link>
                          </div>
                        </div>

                        <div className="p-3 d-flex flex-column justify-content-between flex-grow-1 bg-white">
                          <h6 className="fw-bold text-dark text-truncate mb-1" title={movie.title}>
                            {movie.title}
                          </h6>
                          <div className="small text-secondary mb-2">
                            <span>⏱️ {movie.duration || 120} {t('minutes')}</span>
                          </div>

                          <Link 
                            to={`/movies/${movie.id}`} 
                            className="btn btn-sm btn-danger w-100 fw-bold py-1"
                            style={{ background: '#e50914', borderColor: '#b80710' }}
                          >
                            {t('buyTicket')}
                          </Link>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}

        </Container>
      </main>

      {/* CINEMAX Footer */}
      <footer className="cinemax-footer">
        <Container>
          <Row className="g-4 mb-4">
            <Col xs={12} md={4}>
              <h6 className="fw-bold text-dark mb-3">{t('companyName')}</h6>
              <p className="small text-secondary mb-1">Cinemax Theater System</p>
              <p className="small text-secondary mb-1">123 Cinema Street, Ha Noi</p>
            </Col>

            <Col xs={12} md={4}>
              <h6 className="fw-bold text-dark mb-3">{t('terms')}</h6>
              <ul className="list-unstyled small lh-lg">
                <li><Link to="#" className="text-secondary text-decoration-none">Privacy Policy</Link></li>
                <li><Link to="#" className="text-secondary text-decoration-none">Terms of Service</Link></li>
              </ul>
            </Col>

            <Col xs={12} md={4}>
              <h6 className="fw-bold text-dark mb-3">{t('contact')}</h6>
              <p className="small text-secondary mb-1">{t('hotline')}: <strong>1900 1234</strong></p>
              <p className="small text-secondary mb-1">{t('workHours')}</p>
              <p className="small text-secondary">{t('supportEmail')}</p>
            </Col>
          </Row>
        </Container>

        <div className="cinemax-footer-bottom">
          <Container>
            <div className="fw-bold mb-1">{t('companyName')}</div>
            <div className="mt-2 text-muted">{t('rights')}</div>
          </Container>
        </div>
      </footer>
    </div>
  )
}

export default MovieCatalogPage
