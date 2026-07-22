import React, { useEffect, useState } from 'react'
import CustomerHeader from '@/shared/components/CustomerHeader'
import { useLanguage } from '@/app/providers/LanguageProvider'
import { getRooms, getRoomDetail } from '@/features/staff/services/roomService'
import SeatGrid from '@/shared/components/SeatGrid'
import { buildSeatGrid } from '@/shared/utils/seatLayout'
import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'

const TheaterRoomsPage = () => {
  const { t } = useLanguage()
  const [rooms, setRooms] = useState([])
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [roomDetail, setRoomDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
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

  useEffect(() => {
    if (!activeRoomId) return
    setDetailLoading(true)
    getRoomDetail(activeRoomId)
      .then((res) => setRoomDetail(res.data))
      .catch((err) => {
        console.error('Failed to load room detail:', err)
        setError('Không thể tải sơ đồ ghế của phòng chiếu.')
      })
      .finally(() => setDetailLoading(false))
  }, [activeRoomId])

  const gridRows = roomDetail ? buildSeatGrid(roomDetail) : []

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
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`btn fw-bold px-4 py-2 text-uppercase ${
                      activeRoomId === room.id ? 'btn-danger text-white shadow' : 'btn-outline-dark bg-white'
                    }`}
                    style={{ borderRadius: '6px', fontSize: '15px' }}
                  >
                    🎥 {room.name}
                  </button>
                ))}
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
                {detailLoading || !roomDetail ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="danger" size="sm" />
                  </div>
                ) : (
                  <div style={{ margin: '30px 0 40px 0', overflowX: 'auto', paddingBottom: '10px' }}>
                    <SeatGrid
                      rows={gridRows}
                      getSeatVariant={(seat) =>
                        seat.status === 'INACTIVE' ? 'disabled' : seat.seatType === 'VIP' ? 'vip' : 'normal'
                      }
                      getSeatTitle={(seat) =>
                        `${seat.seatRow}${seat.seatColumn} (${
                          seat.status === 'INACTIVE' ? 'Không khả dụng' : seat.seatType === 'VIP' ? 'VIP' : 'Thường'
                        })`
                      }
                    />
                  </div>
                )}

                {/* Legend Bar */}
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
                        backgroundColor: '#fff',
                        border: '1.5px solid #2e9b4f',
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
                        backgroundColor: '#fff',
                        border: '1.5px solid #d0342c',
                      }}
                    />
                    <span>Ghế VIP</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '5px',
                        backgroundColor: '#eee',
                        border: '1.5px solid #ccc',
                      }}
                    />
                    <span>Không khả dụng</span>
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
