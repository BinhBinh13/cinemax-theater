import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getMovieById, getScheduleByMovieId } from '@/features/staff/services/movieService'
import CustomerHeader from '@/shared/components/CustomerHeader'
import { useLanguage } from '@/app/providers/LanguageProvider'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'

const MovieDetailsPage = () => {
  const { movieId } = useParams()
  const [movie, setMovie] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { t } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true)
        const movieData = await getMovieById(movieId)
        setMovie(movieData)

        const schedulesResponse = await getScheduleByMovieId(movieId)
        setSchedules(schedulesResponse.data || [])
      } catch (err) {
        console.error('Failed to load movie details:', err)
        setError('Không thể tải thông tin chi tiết phim. Vui lòng kiểm tra kết nối.')
      } finally {
        setLoading(false)
      }
    }

    fetchMovieData()
  }, [movieId])

  // Group schedules by Date (e.g. "15/07/2026")
  const groupSchedulesByDate = () => {
    const groups = {}
    
    schedules.forEach((schedule) => {
      const dateKey = new Date(schedule.startTime).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(schedule)
    })
    
    // Sort showtimes inside each group by start time
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    })

    return groups
  }

  const groupedSchedules = groupSchedulesByDate()

  return (
    <div className="cinemax-page-container text-dark min-vh-100 d-flex flex-column">
      <CustomerHeader />

      <main className="flex-grow-1 py-5">
        <Container>
          
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" className="mb-3" />
              <div className="text-secondary">Đang tải thông tin phim...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-5">
              <div className="text-danger mb-3">{error}</div>
              <Button variant="outline-danger" onClick={() => navigate('/')}>Quay lại danh sách phim</Button>
            </div>
          )}

          {!loading && !error && movie && (
            <>
              {/* Breadcrumb / Back button */}
              <div className="mb-4">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  className="fw-bold px-3 py-1.5 d-inline-flex align-items-center gap-2 bg-white shadow-sm"
                  onClick={() => navigate('/')}
                >
                  🏠 {t('backToHome')}
                </Button>
              </div>

              {/* Horizontal banner image */}
              {movie.banner && (
                <div className="mb-4 rounded overflow-hidden shadow-sm">
                  <img
                    src={movie.banner}
                    alt={`${movie.title} banner`}
                    className="w-100"
                    style={{ maxHeight: '360px', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Movie info banner */}
              <Row className="g-4 mb-5">
                <Col xs={12} md={4} lg={3} className="text-center">
                  <img
                    src={movie.poster || 'https://via.placeholder.com/300x450?text=Cinemax'}
                    alt={movie.title}
                    className="img-fluid rounded border border-secondary border-opacity-25"
                    style={{ maxHeight: '420px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
                  />
                </Col>
                
                <Col xs={12} md={8} lg={9}>
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    <h2 className="text-dark fw-bold m-0">{movie.title}</h2>
                    <Badge bg={movie.status === 'NOW_SHOWING' ? 'danger' : 'warning'}>
                      {movie.status === 'NOW_SHOWING' ? 'Đang Chiếu' : 'Sắp Chiếu'}
                    </Badge>
                  </div>

                  <div className="d-flex gap-4 mb-3 text-secondary small flex-wrap">
                    <span>⏱️ <strong>Thời lượng:</strong> {movie.duration} phút</span>
                    {movie.screeningStart && (
                      <span>📅 <strong>Khởi chiếu:</strong> {new Date(movie.screeningStart).toLocaleDateString('vi-VN')}</span>
                    )}
                    {movie.rating != null && (
                      <span>⭐ <strong>Đánh giá:</strong> {movie.rating}/10</span>
                    )}
                  </div>

                  <div className="d-flex gap-4 mb-4 text-secondary small flex-wrap">
                    {movie.director && (
                      <span>🎬 <strong>Đạo diễn:</strong> {movie.director}</span>
                    )}
                    {movie.cast && (
                      <span>👥 <strong>Diễn viên:</strong> {movie.cast}</span>
                    )}
                    {movie.language && (
                      <span>🌐 <strong>Ngôn ngữ:</strong> {movie.language}</span>
                    )}
                  </div>

                  {movie.genres?.length > 0 && (
                    <div className="d-flex gap-2 mb-4 flex-wrap">
                      {movie.genres.map((genre) => (
                        <Badge key={genre.id} bg="secondary">{genre.name}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="mb-4">
                    <h5 className="text-dark fw-semibold mb-2">Tóm Tắt Phim</h5>
                    <p className="text-secondary small lh-lg" style={{ maxWidth: '800px' }}>
                      {movie.description || 'Chưa có thông tin tóm tắt nội dung phim.'}
                    </p>
                  </div>

                  {movie.trailerUrl && (
                    <Button
                      variant="outline-dark"
                      size="sm"
                      href={movie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-4"
                    >
                      ▶️ Xem Trailer
                    </Button>
                  )}
                </Col>
              </Row>

              {/* Showtimes Selection Section */}
              <hr className="border-secondary opacity-25 my-5" />

              <div>
                <h4 className="text-dark fw-bold mb-4">Lịch Chiếu & Suất Chiếu</h4>
                
                {schedules.length === 0 ? (
                  <div className="glass-card p-4 text-center text-secondary small">
                    Phim hiện chưa có lịch chiếu nào được lên kế hoạch. Vui lòng quay lại sau!
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {Object.keys(groupedSchedules).map((dateStr) => (
                      <Card key={dateStr} className="glass-card border-0 p-4">
                        <h5 className="text-gold fw-semibold mb-3 border-bottom border-secondary border-opacity-10 pb-2 capitalize">
                          📅 {dateStr}
                        </h5>
                        
                        <Row className="g-3">
                          {groupedSchedules[dateStr].map((schedule) => {
                            const startTime = new Date(schedule.startTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            const endTime = schedule.endTime 
                              ? new Date(schedule.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                              : ''
                            
                            return (
                              <Col key={schedule.id} xs={6} sm={4} md={3} lg={2.4}>
                                <Card
                                  as={Link}
                                  to={`/booking/${schedule.id}`}
                                  className="bg-light border text-decoration-none text-dark p-3 text-center transition-all h-100"
                                  style={{ borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = '#e50914'
                                    e.currentTarget.style.background = 'rgba(229, 9, 20, 0.06)'
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = ''
                                    e.currentTarget.style.background = ''
                                  }}
                                >
                                  <div className="fs-4 fw-bold text-dark mb-1">{startTime}</div>
                                  {endTime && <div className="small text-secondary mb-2">~ {endTime}</div>}
                                  <div className="small text-gold fw-semibold mb-1">{schedule.roomName}</div>
                                  <Badge bg="secondary" className="small">
                                    {schedule.price ? `${schedule.price.toLocaleString('vi-VN')} đ` : '80.000 đ'}
                                  </Badge>
                                </Card>
                              </Col>
                            )
                          })}
                        </Row>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </Container>
      </main>

      <footer className="cinema-footer py-4 text-center text-secondary small border-top">
        © {new Date().getFullYear()} Cinemax Grand Center. All rights reserved.
      </footer>
    </div>
  )
}

export default MovieDetailsPage
