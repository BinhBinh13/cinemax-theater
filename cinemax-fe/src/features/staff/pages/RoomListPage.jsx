import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  Row,
  Col,
} from 'react-bootstrap'
import StaffSideBar from '../components/StaffSideBar'
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../services/roomService'

const S = {
  page: {
    background: '#f5f5f9',
    minHeight: '100vh',
    color: '#1f2937',
  },
  header: {
    fontSize: 26,
    fontWeight: 700,
    color: '#111827',
    letterSpacing: 0.5,
  },
  headerAccent: { color: '#e50914' },
  searchInput: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    color: '#1f2937',
    borderRadius: 10,
    padding: '10px 16px',
    maxWidth: 300,
    outline: 'none',
    fontSize: 14,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  addBtn: {
    background: 'linear-gradient(135deg, #e50914, #b80710)',
    border: 'none',
    borderRadius: 10,
    padding: '10px 22px',
    fontWeight: 600,
    fontSize: 14,
    color: '#fff',
    boxShadow: '0 2px 8px rgba(229,9,20,0.3)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e5e7eb',
    padding: '22px 24px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
  },
  statRow: {
    display: 'flex',
    gap: 20,
    marginBottom: 16,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#e50914',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  layoutLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardActions: {
    display: 'flex',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTop: '1px solid #e5e7eb',
  },
  actionBtn: {
    border: 'none',
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 0',
    color: '#9ca3af',
  },
}

const emptyForm = {
  name: '',
  rowCount: '',
  columnCount: '',
  status: 'ACTIVE',
}

export default function RoomListPage() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  useEffect(() => { loadRooms() }, [])

  async function loadRooms() {
    setLoading(true)
    try {
      const response = await getRooms()
      setRooms(response.data)
    } catch (error) {
      setIsError(true)
      setMessage(`Failed to load rooms: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingRoom(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(e, room) {
    e.stopPropagation()
    setEditingRoom(room)
    setForm({
      name: room.name,
      rowCount: room.rowCount,
      columnCount: room.columnCount,
      status: room.status,
    })
    setFormError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingRoom(null)
    setForm(emptyForm)
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      name: form.name,
      rowCount: Number(form.rowCount),
      columnCount: Number(form.columnCount),
      status: form.status,
    }
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, payload)
        setMessage('Room updated successfully.')
      } else {
        await createRoom(payload)
        setMessage('Room created successfully.')
      }
      setIsError(false)
      closeModal()
      await loadRooms()
    } catch (error) {
      setFormError(error.response?.data || error.message)
    }
  }

  async function handleDelete(e, room) {
    e.stopPropagation()
    if (!window.confirm(`Delete "${room.name}"? This cannot be undone.`)) return
    try {
      await deleteRoom(room.id)
      setIsError(false)
      setMessage('Room deleted successfully.')
      await loadRooms()
    } catch (error) {
      setIsError(true)
      setMessage(error.response?.data || error.message)
    }
  }

  const q = searchText.trim().toLowerCase()
  const visibleRooms = q
    ? rooms.filter((r) => r.name.toLowerCase().includes(q))
    : rooms

  return (
    <div className="d-flex">
      <StaffSideBar />
      <div style={S.page} className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div style={S.header}>
            🎬 <span style={S.headerAccent}>Room</span> Management
          </div>
          <Button style={S.addBtn} onClick={openAddModal}>
            + New Room
          </Button>
        </div>

        {message && (
          <Alert
            variant={isError ? 'danger' : 'success'}
            onClose={() => setMessage('')}
            dismissible
          >
            {message}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <input
            type="text"
            placeholder="Search rooms..."
            style={S.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <span style={{ color: '#9ca3af', fontSize: 13 }}>
            {visibleRooms.length} room{visibleRooms.length !== 1 && 's'}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
            Loading rooms...
          </div>
        ) : (
          <div style={S.grid}>
            {visibleRooms.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎥</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#6b7280' }}>
                  No rooms found
                </div>
                <div style={{ fontSize: 13 }}>
                  {q ? 'Try a different search term.' : 'Click "+ New Room" to get started.'}
                </div>
              </div>
            ) : (
              visibleRooms.map((room) => (
                <div
                  key={room.id}
                  style={S.card}
                  onClick={() => navigate(`/staff/rooms/${room.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(229,9,20,0.1)'
                    e.currentTarget.style.borderColor = '#f3a3a8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  <div style={S.cardHeader}>
                    <div>
                      <div style={S.roomName}>{room.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {room.theaterName}
                      </div>
                    </div>
                    <Badge
                      bg={room.status === 'ACTIVE' ? 'success' : 'secondary'}
                      style={{ borderRadius: 6, fontSize: 11, padding: '4px 10px' }}
                    >
                      {room.status}
                    </Badge>
                  </div>

                  <div style={S.statRow}>
                    <div style={S.statItem}>
                      <div style={S.statValue}>{room.seatCount}</div>
                      <div style={S.statLabel}>Seats</div>
                    </div>
                    <div style={S.statItem}>
                      <div style={S.statValue}>{room.rowCount}</div>
                      <div style={S.statLabel}>Rows</div>
                    </div>
                    <div style={S.statItem}>
                      <div style={S.statValue}>{room.columnCount}</div>
                      <div style={S.statLabel}>Cols</div>
                    </div>
                  </div>

                  <div style={S.cardActions}>
                    <button
                      style={{ ...S.actionBtn, background: '#f3f4f6', color: '#374151' }}
                      onClick={(e) => openEditModal(e, room)}
                    >
                      Edit
                    </button>
                    <button
                      style={{ ...S.actionBtn, background: '#fef2f2', color: '#ef4444' }}
                      onClick={(e) => handleDelete(e, room)}
                    >
                      Delete
                    </button>
                    <button
                      style={{ ...S.actionBtn, background: '#fdecea', color: '#e50914', marginLeft: 'auto' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/staff/rooms/${room.id}`) }}
                    >
                      View Seats →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={closeModal} size="md" centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: '#111827', fontSize: 18, fontWeight: 700 }}>
            {editingRoom ? '✏️ Update Room' : '➕ New Room'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger">{formError}</Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#374151', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Room Name
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#374151', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Rows
                  </Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={1}
                    max={26}
                    value={form.rowCount}
                    onChange={(e) => setForm({ ...form, rowCount: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#374151', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Columns
                  </Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={1}
                    value={form.columnCount}
                    onChange={(e) => setForm({ ...form, columnCount: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#374151', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Status
              </Form.Label>
              <div style={{ display: 'flex', gap: 20 }}>
                <Form.Check
                  type="radio"
                  label="Active"
                  name="status"
                  checked={form.status === 'ACTIVE'}
                  onChange={() => setForm({ ...form, status: 'ACTIVE' })}
                />
                <Form.Check
                  type="radio"
                  label="Inactive"
                  name="status"
                  checked={form.status === 'INACTIVE'}
                  onChange={() => setForm({ ...form, status: 'INACTIVE' })}
                />
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #e5e7eb' }}>
            <Button
              variant="secondary"
              onClick={closeModal}
              style={{ borderRadius: 8, padding: '8px 20px' }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #e50914, #b80710)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 24px',
                fontWeight: 600,
              }}
            >
              {editingRoom ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}
