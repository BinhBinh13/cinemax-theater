import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getScheduleById } from '@/features/staff/services/movieService'
import { getRoomSeats, getOccupiedSeats, createBooking } from '@/shared/services/bookingService'
import CustomerHeader from '@/shared/components/CustomerHeader'
import { useLanguage } from '@/app/providers/LanguageProvider'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Tab from 'react-bootstrap/Tab'
import Nav from 'react-bootstrap/Nav'

const SeatingChartPage = () => {
  const { scheduleId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [schedule, setSchedule] = useState(null)
  const [seats, setSeats] = useState([])
  const [occupiedSeatIds, setOccupiedSeatIds] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])

  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('VNPAY')

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [confirmedBookingData, setConfirmedBookingData] = useState(null)
  const [timerSeconds, setTimerSeconds] = useState(300) // 5 minutes countdown

  // Card form inputs
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setLoading(true)
        setError(null)

        const scheduleResponse = await getScheduleById(scheduleId)
        const sched = scheduleResponse.data
        setSchedule(sched)

        if (sched && sched.roomId) {
          const seatsData = await getRoomSeats(sched.roomId)
          setSeats(seatsData)
        }

        const occupiedIds = await getOccupiedSeats(scheduleId)
        setOccupiedSeatIds(occupiedIds)
      } catch (err) {
        console.error('Failed to load schedule or seats:', err)
        setError('Không thể tải thông tin suất chiếu hoặc sơ đồ ghế. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    if (scheduleId) {
      loadBookingData()
    }
  }, [scheduleId])

  // Countdown Timer when payment modal opens
  useEffect(() => {
    let interval = null
    if (showPaymentModal && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0 && showPaymentModal) {
      setShowPaymentModal(false)
      alert('Đã hết thời gian giữ ghế. Vui lòng thực hiện đặt lại.')
    }
    return () => clearInterval(interval)
  }, [showPaymentModal, timerSeconds])

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeatClick = (seat) => {
    if (occupiedSeatIds.includes(seat.id)) return

    const isSelected = selectedSeats.some((s) => s.id === seat.id)
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const getTicketPrice = (seat) => {
    const base = schedule?.price || 80000
    if (seat.seatType === 'VIP') return base + 20000
    if (seat.seatType === 'COUPLE') return base + 40000
    return base
  }

  const calculateTotalAmount = () => {
    return selectedSeats.reduce((total, seat) => total + getTicketPrice(seat), 0)
  }

  const handleOpenPaymentModal = () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế để tiến hành thanh toán.')
      return
    }
    setTimerSeconds(300)
    setError(null)
    setShowPaymentModal(true)
  }

  // Execute payment & backend reservation
  const handleConfirmBooking = async () => {
    setBookingLoading(true)
    setError(null)

    try {
      const seatIds = selectedSeats.map((s) => s.id)
      const result = await createBooking(scheduleId, seatIds, paymentMethod)

      setConfirmedBookingData(result || {
        bookingId: Math.floor(100000 + Math.random() * 900000),
        movieTitle: schedule.movieTitle,
        roomName: schedule.roomName,
        totalAmount: calculateTotalAmount(),
        paymentMethod,
        tickets: selectedSeats,
      })

      setShowPaymentModal(false)
      setShowSuccessModal(true)
      setSelectedSeats([])

      // Refresh occupied list
      const occupiedIds = await getOccupiedSeats(scheduleId)
      setOccupiedSeatIds(occupiedIds)
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
    Object.keys(rows).forEach((rowKey) => {
      rows[rowKey].sort((a, b) => a.seatColumn - b.seatColumn)
    })
    return rows
  }

  const seatsByRow = getSeatsByRow()
  const sortedRowKeys = Object.keys(seatsByRow).sort()
  const bookingCode = `CNM-${scheduleId}-${Math.floor(1000 + Math.random() * 9000)}`

  return (
    <div className="cinemax-page-container text-dark min-vh-100 d-flex flex-column">
      <CustomerHeader />

      <main className="flex-grow-1 py-4">
        <Container>
          {/* Back Action Buttons */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <Button
              variant="outline-danger"
              size="sm"
              className="fw-bold px-3 py-1.5 d-flex align-items-center gap-2 bg-white shadow-sm"
              onClick={() => navigate('/')}
            >
              🏠 {t('backToHome')}
            </Button>
            {schedule?.movie?.id && (
              <Button
                variant="outline-secondary"
                size="sm"
                className="fw-bold px-3 py-1.5 d-flex align-items-center gap-2 bg-white shadow-sm"
                onClick={() => navigate(`/movies/${schedule.movie.id}`)}
              >
                🎬 {t('backToMovieDetails')}
              </Button>
            )}
          </div>

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" className="mb-3" />
              <div className="text-secondary fw-bold">Đang tải sơ đồ ghế xem phim...</div>
            </div>
          )}

          {error && !bookingLoading && (
            <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger mb-4 fw-bold">
              {error}
            </Alert>
          )}

          {!loading && schedule && (
            <Row className="g-4">
              {/* Seating Grid (Left Side) */}
              <Col xs={12} xl={8}>
                <div className="bg-white border rounded-3 p-4 p-md-5 text-center shadow-sm">
                  {/* Screen visualizer */}
                  <div className="mb-5">
                    <div
                      style={{
                        width: '70%',
                        margin: '0 auto 15px',
                        height: '6px',
                        background: '#e50914',
                        borderRadius: '50% / 6px 6px 0 0',
                        boxShadow: '0 4px 20px rgba(229, 9, 20, 0.7)',
                      }}
                    ></div>
                    <div className="small text-secondary fw-bold text-uppercase">MÀN HÌNH CHIẾU PHIM (SCREEN)</div>
                  </div>

                  {/* Seat Grid */}
                  <div className="d-flex flex-column gap-2 overflow-auto py-3 align-items-center">
                    {sortedRowKeys.map((rowKey) => (
                      <div key={rowKey} className="d-flex align-items-center gap-2" style={{ minWidth: 'fit-content' }}>
                        <div className="fw-bold text-secondary text-center me-2" style={{ width: '25px' }}>
                          {rowKey}
                        </div>

                        <div className="d-flex gap-2">
                          {seatsByRow[rowKey].map((seat) => {
                            const isOccupied = occupiedSeatIds.includes(seat.id)
                            const isSelected = selectedSeats.some((s) => s.id === seat.id)
                            const isVip = seat.seatType === 'VIP'
                            const isCouple = seat.seatType === 'COUPLE'

                            let bg = '#ffffff'
                            let border = '1.5px solid #d8d5c9'
                            let color = '#4a4a4a'

                            if (isOccupied) {
                              bg = '#eee'
                              border = '1.5px dashed #ccc'
                              color = '#aaa'
                            } else if (isSelected) {
                              bg = '#109353'
                              border = '1.5px solid #109353'
                              color = '#ffffff'
                            } else if (isCouple) {
                              bg = '#fdf0f0'
                              border = '1.5px solid #e54858'
                              color = '#d92b38'
                            } else if (isVip) {
                              bg = '#f2eefb'
                              border = '1.5px solid #8c62dc'
                              color = '#6334bd'
                            }

                            return (
                              <button
                                key={seat.id}
                                disabled={isOccupied}
                                onClick={() => handleSeatClick(seat)}
                                style={{
                                  width: isCouple ? '78px' : '40px',
                                  height: '38px',
                                  borderRadius: '6px',
                                  background: bg,
                                  border: border,
                                  color: color,
                                  fontWeight: '700',
                                  fontSize: '12px',
                                  cursor: isOccupied ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                title={
                                  isOccupied
                                    ? `Ghế ${seat.seatRow}${seat.seatColumn} đã được đặt`
                                    : `Ghế ${seat.seatRow}${seat.seatColumn} (${seat.seatType})`
                                }
                              >
                                {isOccupied ? 'X' : `${seat.seatRow}${seat.seatColumn}`}
                              </button>
                            )
                          })}
                        </div>

                        <div className="fw-bold text-secondary text-center ms-2" style={{ width: '25px' }}>
                          {rowKey}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seat Legend */}
                  <div className="d-flex justify-content-center gap-4 flex-wrap mt-4 pt-3 border-top small text-secondary fw-semibold">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#f4f3eb', border: '1.5px solid #d8d5c9' }}></span>
                      <span>Ghế thường</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#f2eefb', border: '1.5px solid #8c62dc' }}></span>
                      <span>Ghế VIP</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: '28px', height: '16px', borderRadius: '4px', background: '#fdf0f0', border: '1.5px solid #e54858' }}></span>
                      <span>Ghế đôi (Couple)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#109353' }}></span>
                      <span>Đang chọn</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#eee', border: '1.5px dashed #ccc' }}></span>
                      <span>Đã bán</span>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Booking panel / Checkout details (Right Side) */}
              <Col xs={12} xl={4}>
                <div className="bg-white border rounded-3 p-4 d-flex flex-column h-100 justify-content-between shadow-sm">
                  <div>
                    <h4 className="text-dark fw-black mb-3 border-bottom pb-2">THÔNG TIN ĐẶT VÉ</h4>

                    {/* Movie Info */}
                    <div className="mb-4">
                      <h5 className="text-danger fw-black mb-1">{schedule.movieTitle}</h5>
                      <div className="text-secondary small lh-lg">
                        <div>🎬 <strong>Phòng chiếu:</strong> {schedule.roomName}</div>
                        <div>🕒 <strong>Suất chiếu:</strong> {new Date(schedule.startTime).toLocaleString('vi-VN', {
                          weekday: 'long',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</div>
                      </div>
                    </div>

                    <hr className="mb-4" />

                    {/* Selected Seats details */}
                    <div className="mb-4">
                      <h6 className="text-dark fw-bold mb-2">Vị Trí Ghế Chọn ({selectedSeats.length}):</h6>
                      {selectedSeats.length === 0 ? (
                        <div className="text-muted small italic">Chưa chọn ghế nào. Vui lòng nhấp chọn trên sơ đồ ghế.</div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex flex-wrap gap-1.5">
                            {selectedSeats.map((seat) => (
                              <Badge key={seat.id} bg="danger" className="px-2 py-1 fs-7">
                                Ghế {seat.seatRow}{seat.seatColumn} ({seat.seatType})
                              </Badge>
                            ))}
                          </div>

                          <div className="mt-3 bg-light p-3 rounded border small">
                            {selectedSeats.map((seat) => (
                              <div key={seat.id} className="d-flex justify-content-between text-secondary mb-1">
                                <span>Ghế {seat.seatRow}{seat.seatColumn} ({seat.seatType})</span>
                                <span className="fw-bold text-dark">{getTicketPrice(seat).toLocaleString('vi-VN')} đ</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <hr className="mb-4" />

                    {/* Payment Method Quick Select */}
                    <div className="mb-4">
                      <h6 className="text-dark fw-bold mb-2">Phương Thức Thanh Toán:</h6>
                      <Form.Check
                        type="radio"
                        id="pm-vnpay"
                        label="💳 VNPAY-QR / VietQR (Ngân hàng)"
                        name="paymentMethod"
                        value="VNPAY"
                        checked={paymentMethod === 'VNPAY'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="small text-dark fw-semibold mb-2"
                      />
                      <Form.Check
                        type="radio"
                        id="pm-momo"
                        label="🟣 Ví Điện Tử MoMo"
                        name="paymentMethod"
                        value="MOMO"
                        checked={paymentMethod === 'MOMO'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="small text-dark fw-semibold mb-2"
                      />
                      <Form.Check
                        type="radio"
                        id="pm-card"
                        label="💳 Thẻ Quốc Tế (Visa / Mastercard)"
                        name="paymentMethod"
                        value="CARD"
                        checked={paymentMethod === 'CARD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="small text-dark fw-semibold mb-2"
                      />
                      <Form.Check
                        type="radio"
                        id="pm-cash"
                        label="💵 Thanh toán tại quầy (Tiền mặt)"
                        name="paymentMethod"
                        value="CASH"
                        checked={paymentMethod === 'CASH'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="small text-dark fw-semibold"
                      />
                    </div>
                  </div>

                  {/* Total Amount & Checkout Button */}
                  <div className="pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-secondary fw-bold">Tổng Thanh Toán:</span>
                      <span className="text-danger fw-black fs-3">{calculateTotalAmount().toLocaleString('vi-VN')} đ</span>
                    </div>

                    <Button
                      variant="danger"
                      className="w-100 py-2.5 fw-bold uppercase fs-6 shadow-sm"
                      style={{ background: '#e50914', borderColor: '#b80710' }}
                      onClick={handleOpenPaymentModal}
                      disabled={selectedSeats.length === 0}
                    >
                      💳 TIẾN HÀNH THANH TOÁN
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* Interactive Payment Gateway Checkout Modal */}
          <Modal 
            show={showPaymentModal} 
            onHide={() => setShowPaymentModal(false)} 
            size="lg" 
            centered 
            backdrop="static"
          >
            <Modal.Header closeButton className="bg-dark text-white border-bottom border-danger">
              <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
                💳 CỔNG THANH TOÁN ĐIỆN ẢNH CINEMAX
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4 bg-light">
              <Row className="g-4">
                {/* Left: Invoice Summary */}
                <Col xs={12} md={5} className="border-end border-secondary border-opacity-25">
                  <div className="bg-white p-3 rounded border mb-3 shadow-xs">
                    <div className="badge bg-danger mb-2">ĐƠN HÀNG #{bookingCode}</div>
                    <h5 className="fw-bold text-dark mb-1">{schedule?.movieTitle}</h5>
                    <p className="small text-secondary mb-2">🎥 {schedule?.roomName}</p>

                    <div className="small text-secondary mb-3">
                      <div>🗓️ <strong>Ngày chiếu:</strong> {new Date(schedule?.startTime).toLocaleDateString('vi-VN')}</div>
                      <div>⏰ <strong>Suất:</strong> {new Date(schedule?.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>

                    <div className="border-top pt-2">
                      <div className="small fw-bold text-dark mb-1">Ghế đã chọn:</div>
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {selectedSeats.map((s) => (
                          <Badge key={s.id} bg="dark" className="fs-8">
                            {s.seatRow}{s.seatColumn}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="border-top pt-2 d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-dark">Tổng cộng:</span>
                      <span className="text-danger fw-black fs-5">{calculateTotalAmount().toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="bg-warning bg-opacity-10 border border-warning rounded p-2 text-center small text-dark fw-semibold">
                    ⏳ Thời gian giữ ghế còn lại: <span className="text-danger fw-bold fs-6">{formatTimer(timerSeconds)}</span>
                  </div>
                </Col>

                {/* Right: Payment Gateway Selection */}
                <Col xs={12} md={7}>
                  <Tab.Container id="payment-gateways" defaultActiveKey={paymentMethod}>
                    <Nav variant="pills" className="bg-white border rounded p-1 mb-3 gap-1">
                      <Nav.Item>
                        <Nav.Link eventKey="VNPAY" onClick={() => setPaymentMethod('VNPAY')} className="small fw-bold py-1.5">
                          💳 VNPAY / QR
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="MOMO" onClick={() => setPaymentMethod('MOMO')} className="small fw-bold py-1.5">
                          🟣 Ví MoMo
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="CARD" onClick={() => setPaymentMethod('CARD')} className="small fw-bold py-1.5">
                          💳 Thẻ Visa/Master
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="CASH" onClick={() => setPaymentMethod('CASH')} className="small fw-bold py-1.5">
                          💵 Tiền mặt
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>

                    <Tab.Content className="bg-white p-3 rounded border">
                      {/* VNPAY / VietQR */}
                      <Tab.Pane eventKey="VNPAY">
                        <div className="text-center">
                          <h6 className="fw-bold text-primary mb-2">QUÉT MÃ VNPAY / VIETQR ĐỂ THANH TOÁN</h6>
                          <div className="mb-3">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CINEMAX_VNPAY_${bookingCode}_${calculateTotalAmount()}`}
                              alt="VNPAY QR"
                              className="border p-2 rounded shadow-sm"
                              style={{ width: '170px', height: '170px' }}
                            />
                          </div>

                          <div className="small text-start bg-light p-2.5 rounded border mb-3">
                            <div>🏦 <strong>Ngân hàng:</strong> MBBank (Nội địa & QR)</div>
                            <div>👤 <strong>Chủ tài khoản:</strong> CINEMAX VIETNAM CO., LTD</div>
                            <div>🔢 <strong>Số tài khoản:</strong> 1900 6017 8888</div>
                            <div>💬 <strong>Nội dung CK:</strong> <span className="text-danger fw-bold">{bookingCode}</span></div>
                          </div>

                          <Button
                            variant="danger"
                            className="w-100 fw-bold py-2"
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                          >
                            {bookingLoading ? <Spinner animation="border" size="sm" /> : '✅ TÔI ĐÃ CHUYỂN KHOẢN THANH TOÁN'}
                          </Button>
                        </div>
                      </Tab.Pane>

                      {/* MoMo Wallet */}
                      <Tab.Pane eventKey="MOMO">
                        <div className="text-center">
                          <h6 className="fw-bold text-danger mb-2">THANH TOÁN QUA VÍ ĐIỆN TỬ MOMO</h6>
                          <div className="mb-3">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CINEMAX_MOMO_${bookingCode}_${calculateTotalAmount()}`}
                              alt="MoMo QR"
                              className="border p-2 rounded shadow-sm border-danger"
                              style={{ width: '170px', height: '170px' }}
                            />
                          </div>

                          <div className="small text-start bg-light p-2.5 rounded border mb-3">
                            <div>📱 <strong>Ví MoMo:</strong> 0901234567 (Cinemax Theater)</div>
                            <div>💰 <strong>Số tiền:</strong> {calculateTotalAmount().toLocaleString('vi-VN')} đ</div>
                          </div>

                          <Button
                            variant="danger"
                            className="w-100 fw-bold py-2"
                            style={{ background: '#a50064', borderColor: '#80004d' }}
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                          >
                            {bookingLoading ? <Spinner animation="border" size="sm" /> : '🟣 XÁC NHẬN THANH TOÁN MOMO'}
                          </Button>
                        </div>
                      </Tab.Pane>

                      {/* Credit Card */}
                      <Tab.Pane eventKey="CARD">
                        <div>
                          <h6 className="fw-bold text-dark mb-3">THANH TOÁN THẺ QUỐC TẾ (VISA / MASTERCARD)</h6>
                          <Form>
                            <Form.Group className="mb-2">
                              <Form.Label className="small fw-bold text-dark">Số Thẻ (Card Number)</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="4532 •••• •••• 8892"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                size="sm"
                              />
                            </Form.Group>

                            <Row className="g-2 mb-2">
                              <Col xs={6}>
                                <Form.Group>
                                  <Form.Label className="small fw-bold text-dark">Hạn Thẻ (MM/YY)</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="12/28"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    size="sm"
                                  />
                                </Form.Group>
                              </Col>
                              <Col xs={6}>
                                <Form.Group>
                                  <Form.Label className="small fw-bold text-dark">Mã CVC/CVV</Form.Label>
                                  <Form.Control
                                    type="password"
                                    placeholder="888"
                                    value={cardCvc}
                                    onChange={(e) => setCardCvc(e.target.value)}
                                    size="sm"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>

                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-dark">Tên Chủ Thẻ</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="NGUYEN VAN A"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value)}
                                size="sm"
                              />
                            </Form.Group>

                            <Button
                              variant="dark"
                              className="w-100 fw-bold py-2"
                              onClick={handleConfirmBooking}
                              disabled={bookingLoading}
                            >
                              {bookingLoading ? <Spinner animation="border" size="sm" /> : '💳 XÁC NHẬN THANH TOÁN THẺ'}
                            </Button>
                          </Form>
                        </div>
                      </Tab.Pane>

                      {/* Cash at Counter */}
                      <Tab.Pane eventKey="CASH">
                        <div className="text-center py-2">
                          <h6 className="fw-bold text-dark mb-2">THANH TOÁN TIỀN MẶT TẠI QUẦY VÉ</h6>
                          <p className="small text-secondary mb-4">
                            Hệ thống sẽ giữ chỗ cho bạn. Vui lòng đọc Mã Đơn Hàng <strong className="text-danger">{bookingCode}</strong> tại quầy vé trước giờ chiếu 15 phút để lấy vé.
                          </p>

                          <Button
                            variant="success"
                            className="w-100 fw-bold py-2"
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                          >
                            {bookingLoading ? <Spinner animation="border" size="sm" /> : '💵 XÁC NHẬN GIỮ CHỖ TẠI QUẦY'}
                          </Button>
                        </div>
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </Col>
              </Row>
            </Modal.Body>
          </Modal>

          {/* E-Ticket Success Confirmation Modal */}
          <Modal 
            show={showSuccessModal} 
            onHide={() => setShowSuccessModal(false)} 
            centered 
            backdrop="static"
          >
            <Modal.Header className="bg-success text-white text-center justify-content-center">
              <Modal.Title className="fw-bold fs-5">
                🎉 ĐẶT VÉ VÀ THANH TOÁN THÀNH CÔNG!
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4 text-center">
              <div className="mb-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TICKET_CONFIRMED_${confirmedBookingData?.bookingId}`}
                  alt="E-Ticket QR"
                  className="border p-2 rounded shadow-sm"
                />
              </div>

              <h5 className="fw-bold text-dark mb-1">{confirmedBookingData?.movieTitle}</h5>
              <div className="small text-secondary mb-3">🎥 {confirmedBookingData?.roomName}</div>

              <div className="bg-light p-3 rounded border text-start small mb-4">
                <div>🎟️ <strong>Mã đơn hàng:</strong> #{confirmedBookingData?.bookingId}</div>
                <div>💳 <strong>Phương thức:</strong> {confirmedBookingData?.paymentMethod}</div>
                <div>💰 <strong>Tổng thanh toán:</strong> <strong className="text-danger">{confirmedBookingData?.totalAmount?.toLocaleString('vi-VN')} đ</strong></div>
              </div>

              <div className="d-flex gap-2">
                <Button variant="danger" className="w-100 fw-bold py-2" onClick={() => navigate('/history')}>
                  🎟️ VÉ CỦA TÔI
                </Button>
                <Button variant="outline-dark" className="w-100 fw-bold py-2" onClick={() => navigate('/')}>
                  🏠 TRANG CHỦ
                </Button>
              </div>
            </Modal.Body>
          </Modal>

        </Container>
      </main>

      <footer className="cinemax-footer">
        <Container className="text-center">
          <div className="fw-bold mb-1">{t('companyName')}</div>
          <div className="small text-secondary">{t('hotline')}: 1900 1234 | {t('supportEmail')}</div>
        </Container>
      </footer>
    </div>
  )
}

export default SeatingChartPage
