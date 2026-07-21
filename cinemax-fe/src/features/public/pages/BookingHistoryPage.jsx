import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBookingHistory } from '@/features/customer/services/BookingService'
import CustomerHeader from '@/shared/components/CustomerHeader'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const statusLabels = {
  CONFIRMED: { text: 'Đã Xác Nhận', bg: 'success' },
  PENDING: { text: 'Chờ Thanh Toán', bg: 'warning' },
  CANCELLED: { text: 'Đã Huỷ', bg: 'secondary' },
}

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getBookingHistory()
        setBookings(data)
      } catch (err) {
        console.error('Failed to load booking history:', err)
        setError('Không thể tải lịch sử giao dịch. Vui lòng kiểm tra lại kết nối.')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className="cinema-bg text-dark min-vh-100 d-flex flex-column">
      <CustomerHeader />

      <main className="flex-grow-1 py-5">
        <Container style={{ maxWidth: '900px' }}>

          <div className="mb-4">
            <h2 className="text-dark fw-bold mb-1">Lịch Sử Đặt Vé</h2>
            <p className="text-secondary small">Danh sách các vé xem phim bạn đã giao dịch</p>
          </div>

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" className="mb-3" />
              <div className="text-secondary">Đang tải lịch sử đặt vé...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-5 text-danger small">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {bookings.length === 0 ? (
                <div className="glass-card p-5 text-center text-secondary small">
                  <div className="fs-3 mb-3">🎫</div>
                  <p className="mb-4">Bạn chưa thực hiện bất kỳ giao dịch đặt vé nào.</p>
                  <Link to="/" className="btn btn-danger neon-btn px-4 py-2">
                    Xem lịch chiếu & Đặt vé ngay
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {bookings.map((booking) => {
                    const bookingTimeStr = booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''
                    const statusInfo = statusLabels[booking.status] ?? { text: booking.status, bg: 'secondary' }

                    return (
                      <Card key={booking.bookingId} className="glass-card border-0 overflow-hidden">

                        {/* Card Header (Transaction Meta) */}
                        <div
                          className="px-4 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                          style={{ background: '#f8f9fa', borderBottom: '1px solid #e5e7eb' }}
                        >
                          <div className="small text-secondary">
                            Mã HĐ: <strong className="text-dark">{booking.txnRef ?? `#${booking.bookingId}`}</strong>
                            <span className="mx-2 text-muted">|</span>
                            Ngày đặt: <strong className="text-dark">{bookingTimeStr}</strong>
                          </div>

                          <div className="d-flex gap-2 align-items-center">
                            <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>
                            {booking.paymentMethod && (
                              <Badge bg="secondary" className="text-uppercase">{booking.paymentMethod}</Badge>
                            )}
                          </div>
                        </div>

                        {/* Card Body (Movie & Seating details) */}
                        <Card.Body className="p-4">
                          <Row className="g-3">
                            <Col xs={12} md={7}>
                              <h4 className="text-danger fw-bold mb-2">{booking.movieTitle}</h4>
                              <div className="text-secondary small d-flex flex-column gap-1">
                                <div>🎥 <strong>Phòng chiếu:</strong> {booking.roomName}</div>
                                <div className="text-dark">🕒 <strong>Suất chiếu:</strong> {booking.showtime}</div>
                              </div>
                            </Col>

                            <Col xs={12} md={5} className="d-flex flex-column justify-content-between align-items-md-end text-start text-md-end">
                              <div>
                                <span className="small text-secondary d-block mb-1">Ghế đã đặt:</span>
                                <div className="d-flex flex-wrap gap-1 justify-content-md-end">
                                  {booking.seatCodes?.map((seatCode) => (
                                    <Badge key={seatCode} bg="dark" className="border border-secondary border-opacity-20 px-2 py-1.5 fs-7">
                                      {seatCode}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="mt-3 mt-md-0">
                                <span className="small text-secondary d-block">Tổng tiền thanh toán:</span>
                                <span className="text-gold fw-bold fs-4">{booking.totalAmount.toLocaleString('vi-VN')} đ</span>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )
                  })}
                </div>
              )}
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

export default BookingHistoryPage
