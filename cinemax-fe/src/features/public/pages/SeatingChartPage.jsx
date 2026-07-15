import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getScheduleById } from '@/features/staff/services/movieService'
import { getRoomSeats, getOccupiedSeats, createBooking } from '@/shared/services/bookingService'
import CustomerHeader from '@/shared/components/CustomerHeader'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'

const SeatingChartPage = () => {
  const { scheduleId } = useParams()
  const navigate = useNavigate()

  const [schedule, setSchedule] = useState(null)
  const [seats, setSeats] = useState([])
  const [occupiedSeatIds, setOccupiedSeatIds] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])

  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Load Schedule details
        const scheduleResponse = await getScheduleById(scheduleId)
        const sched = scheduleResponse.data
        setSchedule(sched)

        // 2. Load seats of the room playing this schedule
        const seatsData = await getRoomSeats(sched.roomId)
        setSeats(seatsData)

        // 3. Load occupied seats for this schedule
        const occupiedIds = await getOccupiedSeats(scheduleId)
        setOccupiedSeatIds(occupiedIds)
      } catch (err) {
        console.error('Failed to load seat layout:', err)
        setError('Không thể tải sơ đồ ghế phòng chiếu. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    loadBookingData()
  }, [scheduleId])

  // Seat click handler
  const handleSeatClick = (seat) => {
    // If seat is occupied or inactive, ignore clicks
    if (occupiedSeatIds.includes(seat.id) || seat.status === 'INACTIVE') {
      return
    }

    const isSelected = selectedSeats.some((s) => s.id === seat.id)
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id))
    } else {
      // Limit to max 6 seats per transaction for security/fairness
      if (selectedSeats.length >= 6) {
        alert('Bạn chỉ được phép đặt tối đa 6 ghế trong một giao dịch.')
        return
      }
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  // Calculate prices
  const getTicketPrice = (seat) => {
    const base = schedule?.price || 80000
    if (seat.seatType === 'VIP') {
      return base + 20000
    }
    if (seat.seatType === 'COUPLE') {
      return base + 40000
    }
    return base
  }

  const calculateTotalAmount = () => {
    return selectedSeats.reduce((total, seat) => total + getTicketPrice(seat), 0)
  }

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế.')
      return
    }

    setBookingLoading(true)
    setError(null)
    setSuccessMessage('')

    try {
      const seatIds = selectedSeats.map((s) => s.id)
      await createBooking(scheduleId, seatIds, paymentMethod)

      setSuccessMessage('Giao dịch đặt vé thành công! Đang chuyển đến Lịch sử đặt vé...')
      setSelectedSeats([])
      
      // Refresh occupied list
      const occupiedIds = await getOccupiedSeats(scheduleId)
      setOccupiedSeatIds(occupiedIds)

      setTimeout(() => {
        navigate('/history')
      }, 2500)
    } catch (err) {
      console.error('Booking failed:', err)
      const errMsg = err.response?.data?.message || err.message || 'Đặt vé thất bại.'
      setError(errMsg)
    } finally {
      setBookingLoading(false)
    }
  }

  // Group seats by Row letter
  const getSeatsByRow = () => {
    const rows = {}
    seats.forEach((seat) => {
      if (!rows[seat.seatRow]) {
        rows[seat.seatRow] = []
      }
      rows[seat.seatRow].push(seat)
    })

    // Sort columns inside each row
    Object.keys(rows).forEach((rowKey) => {
      rows[rowKey].sort((a, b) => a.seatColumn - b.seatColumn)
    })

    return rows
  }

  const seatsByRow = getSeatsByRow()
  const sortedRowKeys = Object.keys(seatsByRow).sort()

  return (
    <div className="cinema-bg text-light min-vh-100 d-flex flex-column">
      <CustomerHeader />

      <main className="flex-grow-1 py-5">
        <Container>
          
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" className="mb-3" />
              <div className="text-secondary">Đang tải sơ đồ ghế...</div>
            </div>
          )}

          {error && !bookingLoading && (
            <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger mb-4">
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="border-0 bg-success bg-opacity-10 text-success mb-4 text-center">
              🎉 {successMessage}
            </Alert>
          )}

          {!loading && schedule && (
            <Row className="g-4">
              {/* Seating Grid (Left Side) */}
              <Col xs={12} xl={8}>
                <div className="glass-card p-4 p-md-5 text-center">
                  
                  {/* Screen visualizer */}
                  <div className="mb-5">
                    <div className="cinema-screen" style={{
                      width: '70%',
                      margin: '0 auto 15px',
                      height: '6px',
                      background: '#e50914',
                      borderRadius: '50% / 6px 6px 0 0',
                      boxShadow: '0 4px 20px rgba(229, 9, 20, 0.7)'
                    }}></div>
                    <div className="small text-secondary fw-semibold text-uppercase">Màn Hình Chiếu Phim</div>
                  </div>

                  {/* Seat Grid */}
                  <div className="d-flex flex-column gap-2 overflow-auto py-3 align-items-center">
                    {sortedRowKeys.map((rowKey) => (
                      <div key={rowKey} className="d-flex align-items-center gap-2" style={{ minWidth: 'fit-content' }}>
                        
                        {/* Row letter left */}
                        <div className="fw-bold text-secondary text-center" style={{ width: '25px' }}>{rowKey}</div>

                        {/* Seats in row */}
                        <div className="d-flex gap-2">
                          {seatsByRow[rowKey].map((seat) => {
                            const isOccupied = occupiedSeatIds.includes(seat.id)
                            const isSelected = selectedSeats.some((s) => s.id === seat.id)
                            
                            // Determine style
                            let bg = 'rgba(255, 255, 255, 0.05)'
                            let border = '1px solid rgba(255, 255, 255, 0.15)'
                            let color = '#a3a3a8'
                            let cursor = 'pointer'

                            if (isOccupied) {
                              bg = 'rgba(255, 255, 255, 0.05)'
                              border = '1px dashed rgba(255, 255, 255, 0.1)'
                              color = 'rgba(255, 255, 255, 0.1)'
                              cursor = 'not-allowed'
                            } else if (isSelected) {
                              bg = '#198754' // Green
                              border = '1px solid #198754'
                              color = '#fff'
                            } else if (seat.seatType === 'VIP') {
                              border = '1px solid #6f42c1' // Purple border for VIP
                              bg = 'rgba(111, 66, 193, 0.1)'
                              color = '#a07bf0'
                            } else if (seat.seatType === 'COUPLE') {
                              border = '1px solid #fd357e' // Pink border for Couple
                              bg = 'rgba(253, 53, 126, 0.1)'
                              color = '#fd357e'
                            }

                            return (
                              <div
                                key={seat.id}
                                onClick={() => handleSeatClick(seat)}
                                style={{
                                  width: seat.seatType === 'COUPLE' ? '70px' : '36px',
                                  height: '36px',
                                  background: bg,
                                  border: border,
                                  color: color,
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: cursor,
                                  userSelect: 'none',
                                  transition: 'all 0.15s'
                                }}
                                className="seat-cell"
                                title={`Hàng ${seat.seatRow} - Ghế ${seat.seatColumn} (${seat.seatType})`}
                              >
                                {isOccupied ? 'X' : `${seat.seatRow}${seat.seatColumn}`}
                              </div>
                            )
                          })}
                        </div>

                        {/* Row letter right */}
                        <div className="fw-bold text-secondary text-center" style={{ width: '25px' }}>{rowKey}</div>

                      </div>
                    ))}
                  </div>

                  {/* Seat Legend */}
                  <div className="d-flex justify-content-center flex-wrap gap-4 mt-5 pt-3 border-top border-secondary border-opacity-10 small text-secondary">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.05)' }}></div>
                      <span>Ghế thường</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #6f42c1', background: 'rgba(111, 66, 193, 0.1)' }}></div>
                      <span>Ghế VIP</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '32px', height: '16px', borderRadius: '4px', border: '1px solid #fd357e', background: 'rgba(253, 53, 126, 0.1)' }}></div>
                      <span>Ghế đôi (Couple)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#198754' }}></div>
                      <span>Đang chọn</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>X</div>
                      <span>Đã bán</span>
                    </div>
                  </div>

                </div>
              </Col>

              {/* Booking panel / Checkout details (Right Side) */}
              <Col xs={12} xl={4}>
                <div className="glass-card p-4 d-flex flex-column h-100 justify-content-between">
                  <div>
                    <h4 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-15 pb-2">Thông Tin Vé</h4>
                    
                    {/* Movie Info */}
                    <div className="mb-4">
                      <h5 className="text-danger fw-bold m-0 mb-1">{schedule.movieTitle}</h5>
                      <div className="text-secondary small">
                        <div>🎬 <strong>Phòng:</strong> {schedule.roomName}</div>
                        <div>🕒 <strong>Suất chiếu:</strong> {new Date(schedule.startTime).toLocaleString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </div>
                    </div>

                    <hr className="border-secondary opacity-15 mb-4" />

                    {/* Selected Seats details */}
                    <div className="mb-4">
                      <h6 className="text-white fw-semibold mb-2">Ghế Đã Chọn:</h6>
                      {selectedSeats.length === 0 ? (
                        <div className="text-muted small">Chưa chọn ghế nào. Vui lòng nhấp vào sơ đồ ghế để chọn.</div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex flex-wrap gap-1.5">
                            {selectedSeats.map((seat) => (
                              <Badge key={seat.id} bg="success" className="px-2.5 py-1.5 fs-7">
                                {seat.seatRow}{seat.seatColumn} ({seat.seatType})
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Breakdown */}
                          <div className="mt-3 bg-white bg-opacity-5 p-3 rounded border border-secondary border-opacity-15 small">
                            {selectedSeats.map((seat) => (
                              <div key={seat.id} className="d-flex justify-content-between text-secondary mb-1">
                                <span>Ghế {seat.seatRow}{seat.seatColumn} ({seat.seatType})</span>
                                <span className="text-white">{getTicketPrice(seat).toLocaleString('vi-VN')} đ</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <hr className="border-secondary opacity-15 mb-4" />

                    {/* Payment methods */}
                    <div className="mb-4">
                      <h6 className="text-white fw-semibold mb-2">Phương Thức Thanh Toán:</h6>
                      <Form.Check
                        type="radio"
                        id="pay-cash"
                        label="Thanh toán tại quầy (Tiền mặt)"
                        name="paymentMethod"
                        value="CASH"
                        checked={paymentMethod === 'CASH'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="small text-secondary mb-2"
                        disabled={bookingLoading}
                      />
                      <Form.Check
                        type="radio"
                        id="pay-momo"
                        label="Ví điện tử MoMo (Simulate)"
                        name="paymentMethod"
                        value="MOMO"
                        checked={paymentMethod === 'MOMO'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="small text-secondary mb-2"
                        disabled={bookingLoading}
                      />
                      <Form.Check
                        type="radio"
                        id="pay-vnpay"
                        label="Cổng thanh toán VNPAY (Simulate)"
                        name="paymentMethod"
                        value="VNPAY"
                        checked={paymentMethod === 'VNPAY'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="small text-secondary"
                        disabled={bookingLoading}
                      />
                    </div>
                  </div>

                  {/* Checkout Actions */}
                  <div className="mt-4 pt-3 border-top border-secondary border-opacity-15">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <span className="text-secondary fw-semibold">Tổng Cộng:</span>
                      <span className="text-danger fw-bold fs-4">{calculateTotalAmount().toLocaleString('vi-VN')} đ</span>
                    </div>

                    {bookingLoading && error && (
                      <div className="text-danger small mb-3">{error}</div>
                    )}

                    <Button 
                      variant="danger" 
                      className="neon-btn w-100 py-2.5" 
                      onClick={handleConfirmBooking}
                      disabled={selectedSeats.length === 0 || bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang xử lý đặt vé...
                        </>
                      ) : (
                        'Xác Nhận Đặt Vé'
                      )}
                    </Button>
                  </div>

                </div>
              </Col>
            </Row>
          )}

        </Container>
      </main>

      <footer className="py-4 text-center text-secondary small border-top border-secondary border-opacity-10" style={{ background: '#0a090f' }}>
        © {new Date().getFullYear()} Cinemax Grand Center. All rights reserved.
      </footer>
    </div>
  )
}

export default SeatingChartPage
