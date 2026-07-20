import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMovies } from '@/features/staff/services/movieService'
import CustomerHeader from '@/shared/components/CustomerHeader'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

const MovieCatalogPage = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

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

  // Filter movies based on status and search query
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
    
    // Status filters
    if (filterStatus === 'ALL') return matchesSearch
    return movie.status === filterStatus && matchesSearch
  })

  return (
    <div className="cinema-bg text-dark min-vh-100 d-flex flex-column">
      <CustomerHeader />

      <main className="flex-grow-1 py-5">
        <Container>
          
          {/* Headline & Filter Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
            <div>
              <h2 className="text-dark fw-bold mb-1">Lịch Chiếu Phim</h2>
              <p className="text-secondary small m-0">Đặt vé xem phim chất lượng cao trực tuyến</p>
            </div>
            
            <div className="d-flex flex-column flex-sm-row gap-2" style={{ maxWidth: '600px' }}>
              {/* Search bar */}
              <InputGroup size="sm" style={{ width: '240px' }}>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="cinema-input"
                />
              </InputGroup>

              {/* Status filter */}
              <Form.Select
                size="sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="cinema-input"
                style={{ width: '160px' }}
              >
                <option value="ALL">Tất cả phim</option>
                <option value="NOW_SHOWING">Đang chiếu</option>
                <option value="COMING_SOON">Sắp chiếu</option>
              </Form.Select>
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" className="mb-3" />
              <div className="text-secondary">Đang tải danh sách phim...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-5">
              <div className="text-danger mb-3">{error}</div>
            </div>
          )}

          {/* Movie Grid */}
          {!loading && !error && (
            <>
              {filteredMovies.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                  Không tìm thấy bộ phim nào phù hợp.
                </div>
              ) : (
                <Row className="g-4">
                  {filteredMovies.map((movie) => (
                    <Col key={movie.id} xs={12} sm={6} md={4} lg={3}>
                      <Card 
                        as={Link} 
                        to={`/movies/${movie.id}`} 
                        className="glass-card h-100 border-0 text-decoration-none d-flex flex-column"
                        style={{ 
                          overflow: 'hidden', 
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'scale(1.03)'
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(229, 9, 20, 0.25)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1.0)'
                          e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.37)'
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', paddingTop: '150%', overflow: 'hidden' }}>
                          <img
                            src={movie.poster || 'https://via.placeholder.com/300x450?text=Cinemax'}
                            alt={movie.title}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Badge
                            bg={movie.status === 'NOW_SHOWING' ? 'danger' : 'warning'}
                            className="position-absolute m-2 px-2 py-1.5 fs-7"
                            style={{ top: 0, left: 0 }}
                          >
                            {movie.status === 'NOW_SHOWING' ? 'Đang Chiếu' : 'Sắp Chiếu'}
                          </Badge>
                        </div>
                        
                        <Card.Body className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                          <Card.Title className="text-dark fs-5 fw-bold text-truncate mb-1">{movie.title}</Card.Title>
                          <div className="d-flex justify-content-between align-items-center text-secondary small">
                            <span>⏱️ {movie.duration} phút</span>
                            {movie.screeningStart && (
                              <span>📅 {new Date(movie.screeningStart).toLocaleDateString('vi-VN')}</span>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}

        </Container>
      </main>

      {/* Footer */}
      <footer className="cinema-footer py-4 text-center mt-5 text-secondary small border-top">
        © {new Date().getFullYear()} Cinemax Grand Center. All rights reserved.
      </footer>
    </div>
  )
}

export default MovieCatalogPage
