import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import StaffSideBar from '../components/StaffSideBar'
import SeatGrid from '@/shared/components/SeatGrid'
import { buildSeatGrid } from '@/shared/utils/seatLayout'
import {
  getRoomDetail,
  updateSeatType,
  updateSeatStatus,
} from '../services/roomService'

export default function RoomDetailPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!roomId) return
    getRoomDetail(roomId)
      .then((res) => { setRoom(res.data); setLoading(false) })
      .catch((err) => {
        setIsError(true)
        setMessage(`Failed to load room: ${err.message}`)
        setLoading(false)
      })
  }, [roomId])

  async function handleSeatClick(seat) {
    if (seat.status === 'INACTIVE') {
      const ok = window.confirm(`Kích hoạt ghế ${seat.seatRow}${seat.seatColumn}?`)
      if (!ok) return
      try {
        await updateSeatStatus(seat.id, 'ACTIVE')
        setRoom((prev) => ({
          ...prev,
          seats: prev.seats.map((s) =>
            s.id === seat.id ? { ...s, status: 'ACTIVE' } : s
          ),
        }))
        setMessage(`Ghế ${seat.seatRow}${seat.seatColumn} đã kích hoạt.`)
        setIsError(false)
      } catch (err) {
        setIsError(true)
        setMessage(err.response?.data || err.message)
      }
      return
    }

    const newType = seat.seatType === 'NORMAL' ? 'VIP' : 'NORMAL'
    try {
      await updateSeatType(seat.id, newType)
      setRoom((prev) => ({
        ...prev,
        seats: prev.seats.map((s) =>
          s.id === seat.id ? { ...s, seatType: newType } : s
        ),
      }))
      setMessage(`Ghế ${seat.seatRow}${seat.seatColumn} → ${newType === 'VIP' ? 'VIP' : 'Thường'}`)
      setIsError(false)
    } catch (err) {
      setIsError(true)
      setMessage(err.response?.data || err.message)
    }
  }

  function handleRightClick(e, seat) {
    e.preventDefault()
    if (seat.status === 'INACTIVE') return
    const ok = window.confirm(`Vô hiệu hóa ghế ${seat.seatRow}${seat.seatColumn}?`)
    if (!ok) return
    updateSeatStatus(seat.id, 'INACTIVE')
      .then(() => {
        setRoom((prev) => ({
          ...prev,
          seats: prev.seats.map((s) =>
            s.id === seat.id ? { ...s, status: 'INACTIVE' } : s
          ),
        }))
        setMessage(`Ghế ${seat.seatRow}${seat.seatColumn} đã vô hiệu hóa.`)
        setIsError(false)
      })
      .catch((err) => {
        setIsError(true)
        setMessage(err.response?.data || err.message)
      })
  }

  if (loading) {
    return (
      <div className="d-flex">
        <StaffSideBar />
        <div style={{ background: '#f7f4ea', minHeight: '100vh' }} className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div style={{ color: '#999' }}>Đang tải...</div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="d-flex">
        <StaffSideBar />
        <div style={{ background: '#f7f4ea', minHeight: '100vh' }} className="flex-grow-1 p-4">
          {message && (
            <Alert variant={isError ? 'danger' : 'info'} onClose={() => setMessage('')} dismissible>
              {message}
            </Alert>
          )}
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh', color: '#c0392b' }}>
            Không tìm thấy phòng.
          </div>
        </div>
      </div>
    )
  }

  const gridRows = buildSeatGrid(room)

  const seatCounts = { NORMAL: 0, VIP: 0, DISABLED: 0 }
  gridRows.forEach((row) =>
    row.seats.forEach((s) => {
      if (s.status === 'INACTIVE') seatCounts.DISABLED++
      else if (s.seatType === 'VIP') seatCounts.VIP++
      else seatCounts.NORMAL++
    })
  )

  return (
    <div className="d-flex">
      <StaffSideBar />
      <div style={{ background: '#f7f4ea', minHeight: '100vh', padding: '20px 24px 40px' }} className="flex-grow-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <button
            onClick={() => navigate('/staff/rooms')}
            style={{
              background: '#b3b3b3', border: 'none', borderRadius: 4, padding: '6px 14px',
              color: '#222', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ← Quay lại
          </button>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#222' }}>
            {room.name}
          </span>
          <span style={{ fontSize: 13, color: '#666' }}>
            {room.theaterName} · {room.rowCount} hàng × {room.columnCount} cột · {room.rowCount * room.columnCount} ghế
          </span>
        </div>

        {message && (
          <Alert
            variant={isError ? 'danger' : 'success'}
            onClose={() => setMessage('')}
            dismissible
            style={{ fontSize: 13, padding: '8px 16px', marginBottom: 12 }}
          >
            {message}
          </Alert>
        )}

        <div style={{
          background: '#f7f4ea', maxWidth: 1227, margin: '0 auto',
          border: '1px solid #ddd', borderRadius: 4,
        }}>
          <div style={{
            background: '#b3b3b3', textAlign: 'center', padding: '10px 0',
            fontSize: 18, fontWeight: 700, color: '#222',
          }}>
            Quản lý ghế
          </div>

          <div style={{ position: 'relative', margin: '30px auto 20px', textAlign: 'center' }}>
            <div style={{
              width: '90%', maxWidth: 1227, height: 50,
              margin: '0 auto',
              borderTop: '4px solid #999',
              borderRadius: '50% / 100px 100px 0 0',
            }} />
            <div style={{
              position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
              letterSpacing: 8, fontSize: 22, fontWeight: 700, color: '#999',
            }}>
              SCREEN
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <SeatGrid
              rows={gridRows}
              getSeatVariant={(seat) =>
                seat.status !== 'ACTIVE' ? 'disabled' : seat.seatType === 'VIP' ? 'vip' : 'normal'
              }
              onSeatClick={handleSeatClick}
              onSeatContextMenu={handleRightClick}
              getSeatTitle={(seat) =>
                seat.status === 'ACTIVE'
                  ? `${seat.seatRow}${seat.seatColumn} (${seat.seatType === 'VIP' ? 'VIP' : 'Thường'}) - Click: đổi loại, Chuột phải: vô hiệu`
                  : `${seat.seatRow}${seat.seatColumn} (Đã vô hiệu) - Click: kích hoạt`
              }
            />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: 60,
            marginTop: 36, paddingBottom: 28, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 2,
                  background: '#fff', border: '2px solid #2e9b4f', display: 'inline-block',
                }} />
                Thường ({seatCounts.NORMAL})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 2,
                  background: '#fff', border: '2px solid #d0342c', display: 'inline-block',
                }} />
                VIP ({seatCounts.VIP})
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 2,
                  background: '#eee', border: '1px solid #ccc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#999', fontSize: 12, fontWeight: 700,
                }}>
                  X
                </span>
                Không thể chọn ({seatCounts.DISABLED})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: '#222', borderTop: '1px solid #ddd', paddingTop: 6 }}>
                Tổng cộng: {seatCounts.NORMAL + seatCounts.VIP + seatCounts.DISABLED} ghế
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#888' }}>
                🖱 Click: đổi Thường ↔ VIP
                <span style={{ margin: '0 4px' }}>|</span>
                Chuột phải: vô hiệu hóa
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
