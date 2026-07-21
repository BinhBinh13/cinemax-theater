import React, { useEffect, useState } from 'react'
import CustomerHeader from '@/shared/components/CustomerHeader'
import { useLanguage } from '@/app/providers/LanguageProvider'
import { getRooms, getRoomDetail } from '@/features/staff/services/roomService'
import Container from 'react-bootstrap/Container'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'

const SEAT_STYLES = {
  NORMAL: {
    bg: '#f4f3eb',
    border: '1.5px solid #d8d5c9',
    color: '#4a4a4a',
  },
  VIP: {
    bg: '#f2eefb',
    border: '1.5px solid #8c62dc',
    color: '#6334bd',
  },
  COUPLE: {
    bg: '#fdf0f0',
    border: '1.5px solid #e54858',
    color: '#d92b38',
  },
}

function getRoomSeatsData(roomId, apiRoom) {
  // If roomId === 2 or room name has "2" -> Room 2 layout (A-C: Normal 8 cols, D-E: VIP 8 cols, F: Couple 8 seats)
  const isRoom2 = roomId === 2 || apiRoom?.name?.includes('2')

  if (isRoom2) {
    // ROOM 2: 6 rows (A..F), 8 cols, Row F has 8 couple seats F1..F8
    const rows = []
    const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F']

    rowLabels.forEach((label) => {
      if (label === 'F') {
        // Row F: 8 Couple Seats F1..F8
        const coupleSeats = []
        for (let c = 1; c <= 8; c++) {
          coupleSeats.push({
            id: `r2_F_${c}`,
            seatRow: 'F',
            seatColumn: c,
            seatLabel: `F${c}`,
            seatType: 'COUPLE',
          })
        }
        rows.push({ label: 'F', seats: coupleSeats, isCoupleRow: true })
      } else {
        const isVip = label === 'D' || label === 'E'
        const cols = []
        for (let c = 1; c <= 8; c++) {
          cols.push({
            id: `r2_${label}_${c}`,
            seatRow: label,
            seatColumn: c,
            seatLabel: `${label}${c}`,
            seatType: isVip ? 'VIP' : 'NORMAL',
          })
        }
        rows.push({ label, seats: cols, isCoupleRow: false })
      }
    })

    return {
      name: apiRoom?.name || 'Phòng chiếu 2',
      status: apiRoom?.status || 'ACTIVE',
      totalSeats: 3 * 8 + 2 * 8 + 8 * 2, // 32 normal + 16 vip + 8 couples(16 capacity) = 64
      rows,
    }
  }

  // ROOM 1: 8 rows (A..H), 10 cols, Row H has 10 couple seats H1..H10
  const rows = []
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  rowLabels.forEach((label) => {
    if (label === 'H') {
      // Row H: 10 Couple Seats H1..H10
      const coupleSeats = []
      for (let c = 1; c <= 10; c++) {
        coupleSeats.push({
          id: `r1_H_${c}`,
          seatRow: 'H',
          seatColumn: c,
          seatLabel: `H${c}`,
          seatType: 'COUPLE',
        })
      }
      rows.push({ label: 'H', seats: coupleSeats, isCoupleRow: true })
    } else {
      const isVip = label === 'E' || label === 'F' || label === 'G'
      const cols = []
      for (let c = 1; c <= 10; c++) {
        cols.push({
          id: `r1_${label}_${c}`,
          seatRow: label,
          seatColumn: c,
          seatLabel: `${label}${c}`,
          seatType: isVip ? 'VIP' : 'NORMAL',
        })
      }
      rows.push({ label, seats: cols, isCoupleRow: false })
    }
  })

  return {
    name: apiRoom?.name || 'Phòng chiếu 1',
    status: apiRoom?.status || 'ACTIVE',
    totalSeats: 4 * 10 + 3 * 10 + 10 * 2, // 40 normal + 30 vip + 10 couples(20 capacity) = 90
    rows,
  }
}

const TheaterRoomsPage = () => {
  const { t } = useLanguage()
  const [rooms, setRooms] = useState([])
  const [activeRoomId, setActiveRoomId] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRoomsData = async () => {
      try {
        const response = await getRooms()
        const roomList = response.data || response || []
        setRooms(roomList)
        if (roomList.length > 0) {
          setActiveRoomId(roomList[0].id)
        }
      } catch (err) {
        console.error('Failed to load rooms:', err)
        setError('Không thể tải dữ liệu phòng chiếu.')
      } finally {
        setLoading(false)
      }
    }

    loadRoomsData()
  }, [])

  const apiRoom = rooms.find((r) => r.id === activeRoomId)
  const roomData = getRoomSeatsData(activeRoomId, apiRoom)

  return (
    <div className="cinemax-page-container d-flex flex-column min-vh-100">
      <CustomerHeader />

      <main className="flex-grow-1 px-3 py-4">
        <Container>
          {/* Header Title */}
          <div className="cinemax-section-title">
            <h3>RẠP CINEMAX - CẤU TRÚC PHÒNG CHIẾU</h3>
          </div>
          <p className="text-center text-secondary small mb-4">
            Sơ đồ chi tiết không gian phòng chiếu theo chuẩn thiết kế Cinemax Theater.
          </p>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" className="mb-3" />
              <div className="fw-bold text-secondary">Đang tải dữ liệu phòng chiếu...</div>
            </div>
          ) : (
            <>
              {/* Room Selector Buttons */}
              <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
                <button
                  onClick={() => setActiveRoomId(1)}
                  className={`btn fw-bold px-4 py-2 text-uppercase ${
                    activeRoomId === 1 ? 'btn-danger text-white shadow' : 'btn-outline-dark bg-white'
                  }`}
                  style={{ borderRadius: '6px', fontSize: '15px' }}
                >
                  🎥 Phòng chiếu 1
                </button>
                <button
                  onClick={() => setActiveRoomId(2)}
                  className={`btn fw-bold px-4 py-2 text-uppercase ${
                    activeRoomId === 2 ? 'btn-danger text-white shadow' : 'btn-outline-dark bg-white'
                  }`}
                  style={{ borderRadius: '6px', fontSize: '15px' }}
                >
                  🎥 Phòng chiếu 2
                </button>
              </div>

              {/* Cinema Theater Room Card */}
              <div
                style={{
                  background: '#faf8f2',
                  maxWidth: 1000,
                  margin: '0 auto',
                  border: '1px solid #e0ded5',
                  borderRadius: '12px',
                  padding: '35px 25px 30px 25px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
              >
                {/* Red Glowing Curved Screen */}
                <div className="text-center mb-5">
                  <div
                    style={{
                      width: '65%',
                      height: '5px',
                      background: '#e50914',
                      borderRadius: '50% / 100px 100px 0 0',
                      margin: '0 auto 12px auto',
                      boxShadow: '0 4px 15px rgba(229, 9, 20, 0.6)',
                    }}
                  />
                  <div
                    style={{
                      color: '#5a6268',
                      fontWeight: '700',
                      fontSize: '15px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    MÀN HÌNH CHIẾU PHIM
                  </div>
                </div>

                {/* Seat Matrix */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '30px 0 40px 0',
                    overflowX: 'auto',
                    paddingBottom: '10px',
                  }}
                >
                  {roomData.rows.map((row) => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Left Row Label */}
                      <span
                        style={{
                          width: '24px',
                          fontWeight: '800',
                          color: '#4a4a4a',
                          fontSize: '15px',
                          textAlign: 'center',
                        }}
                      >
                        {row.label}
                      </span>

                      {/* Seats Row */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {row.seats.map((seat) => {
                          const style = SEAT_STYLES[seat.seatType] || SEAT_STYLES.NORMAL
                          const isCouple = seat.seatType === 'COUPLE'

                          return (
                            <div
                              key={seat.id}
                              style={{
                                width: isCouple ? '78px' : '42px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                                fontWeight: '700',
                                backgroundColor: style.bg,
                                border: style.border,
                                color: style.color,
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                userSelect: 'none',
                                transition: 'transform 0.15s ease',
                              }}
                              title={`${seat.seatLabel} (${isCouple ? 'Ghế đôi Couple' : seat.seatType})`}
                            >
                              {seat.seatLabel}
                            </div>
                          )
                        })}
                      </div>

                      {/* Right Row Label */}
                      <span
                        style={{
                          width: '24px',
                          fontWeight: '800',
                          color: '#4a4a4a',
                          fontSize: '15px',
                          textAlign: 'center',
                        }}
                      >
                        {row.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend Bar matching phong1.png & phong2.png */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '28px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e5e2d8',
                    flexWrap: 'wrap',
                    fontSize: '14px',
                    color: '#555555',
                    fontWeight: '600',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '5px',
                        backgroundColor: '#f4f3eb',
                        border: '1.5px solid #d8d5c9',
                      }}
                    />
                    <span>Ghế thường</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '5px',
                        backgroundColor: '#f2eefb',
                        border: '1.5px solid #8c62dc',
                      }}
                    />
                    <span>Ghế VIP</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '22px',
                        borderRadius: '5px',
                        backgroundColor: '#fdf0f0',
                        border: '1.5px solid #e54858',
                      }}
                    />
                    <span>Ghế đôi (Couple)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '5px',
                        backgroundColor: '#109353',
                      }}
                    />
                    <span>Đang chọn</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '5px',
                        border: '1.5px dashed #b5b5b5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: '#999',
                      }}
                    >
                      X
                    </div>
                    <span>Đã bán</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </Container>
      </main>

      {/* Footer */}
      <footer className="cinemax-footer">
        <Container className="text-center">
          <div className="fw-bold mb-1">{t('companyName')}</div>
          <div className="small text-secondary">{t('hotline')}: 1900 1234 | {t('supportEmail')}</div>
        </Container>
      </footer>
    </div>
  )
}

export default TheaterRoomsPage
