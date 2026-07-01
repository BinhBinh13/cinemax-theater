import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import StaffSideBar from '../components/StaffSideBar'
import {
  getMovieById,
  getScheduleByMovieId,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../services/movieService'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// Backend sends ISO LocalDateTime strings, e.g. "2025-07-10T09:30:00"
function toDatePart(isoDateTime) {
  return isoDateTime.slice(0, 10)
}

function toTimePart(isoDateTime) {
  return isoDateTime.slice(11, 16)
}

const statusLabels = {
  UPCOMING: 'Upcoming',
  SHOWING: 'Showing now',
  ENDED: 'Ended',
}

function groupByDate(schedules) {
  return Object.entries(
    schedules.reduce((acc, st) => {
      const date = toDatePart(st.startTime)
      if (acc[date] === undefined) acc[date] = []
      acc[date].push(st)
      return acc
    }, {})
  )
}

const emptyForm = { date: '', startTime: '', roomId: '' }

export default function MovieScheduleDetail() {
  const { movieId } = useParams()
  const [movie, setMovie] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formError, setFormError] = useState('')
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    Promise.all([getMovieById(movieId), getScheduleByMovieId(movieId)])
      .then(([movieData, scheduleResponse]) => {
        if (!mounted) return
        setMovie(movieData)
        setSchedules(scheduleResponse.data)
      })
      .catch((error) => {
        if (!mounted) return
        setIsError(true)
        setMessage(`Failed to load schedules: ${error.message}`)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [movieId])

  async function reloadSchedules() {
    const response = await getScheduleByMovieId(movieId)
    setSchedules(response.data)
  }

  function openAddModal() {
    setEditingSchedule(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(schedule) {
    setEditingSchedule(schedule)
    setForm({
      date: toDatePart(schedule.startTime),
      startTime: toTimePart(schedule.startTime),
      roomId: schedule.roomId,
    })
    setFormError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingSchedule(null)
    setForm(emptyForm)
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      movieId: Number(movieId),
      roomId: Number(form.roomId),
      date: form.date,
      startTime: form.startTime,
    }

    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, payload)
      } else {
        await createSchedule(payload)
      }
      setIsError(false)
      setMessage(editingSchedule ? 'Schedule updated successfully.' : 'Schedule added successfully.')
      closeModal()
      await reloadSchedules()
    } catch (error) {
      setFormError(error.response?.data || error.message)
    }
  }

  async function handleDelete(schedule) {
    if (!window.confirm('Delete this schedule? This cannot be undone.')) return

    try {
      await deleteSchedule(schedule.id)
      setIsError(false)
      setMessage('Schedule deleted successfully.')
      await reloadSchedules()
    } catch (error) {
      setIsError(true)
      setMessage(error.response?.data || error.message)
    }
  }

  const grouped = groupByDate(schedules)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <StaffSideBar />

      <main style={{ flexGrow: 1, padding: 32, background: '#f9fafb', textAlign: 'left' }}>
        {message && (
          <Alert variant={isError ? 'danger' : 'success'} onClose={() => setMessage('')} dismissible>
            {message}
          </Alert>
        )}

        {loading ? (
          <div style={{ color: '#6b7280', padding: '40px 0', fontSize: 16 }}>
            Loading schedule...
          </div>
        ) : !movie ? (
          <div style={{ color: '#ef4444', padding: '40px 0', fontSize: 16 }}>
            Movie not found.
          </div>
        ) : (
          <>
            <div style={s.movieInfoBox}>
              <img src={movie.poster} alt={movie.title} style={s.poster} />
              <div style={s.movieMeta}>
                <h2 style={s.movieTitle}>{movie.title}</h2>
                <p style={s.metaRow}>
                  <span style={s.metaLabel}>Duration:</span> {movie.duration} minutes
                </p>
                <p style={s.metaRow}>
                  <span style={s.metaLabel}>Screening Period:</span>{' '}
                  {formatDate(movie.screeningStart)} - {formatDate(movie.screeningEnd)}
                </p>
              </div>
              <button style={s.addBtn} onClick={openAddModal}>+ Add new schedule</button>
            </div>

            <h5 style={s.sectionTitle}>Schedule</h5>

            <div style={s.scheduleList}>
              {grouped.length === 0 ? (
                <div style={{ color: '#6b7280', padding: '24px 0' }}>No schedules available.</div>
              ) : (
                grouped.map(([date, dateSchedules]) => (
                  <div key={date} style={s.dateGroup}>
                    <p style={s.dateLabel}>{formatDisplayDate(date)}</p>
                    <div style={s.showtimeList}>
                      {dateSchedules.map((st) => (
                        <div key={st.id} style={s.showtimeRow}>
                          <span style={s.timeRange}>{toTimePart(st.startTime)} - {toTimePart(st.endTime)}</span>
                          <div style={s.showtimeCard}>
                            <span style={s.showtimeTime}>{toTimePart(st.startTime)} - {toTimePart(st.endTime)}</span>
                            <span style={s.showtimeInfo}>Room: {st.roomName}</span>
                            <span style={{ ...s.showtimeInfo, ...s.statusBadge[st.status] }}>
                              {statusLabels[st.status] ?? st.status}
                            </span>
                          </div>
                          {st.status === 'UPCOMING' && (
                            <>
                              <Button size="sm" variant="outline-secondary" onClick={() => openEditModal(st)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => handleDelete(st)}>
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingSchedule ? 'Update schedule' : 'Add new schedule'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {movie && (
              <div style={s.modalMovieInfo}>
                <img src={movie.poster} alt={movie.title} style={s.modalPoster} />
                <div>
                  <p style={s.modalMovieTitle}>{movie.title}</p>
                  <p style={s.modalMovieMeta}>Duration: {movie.duration} minutes</p>
                  <p style={s.modalMovieMeta}>
                    Screening Period: {formatDate(movie.screeningStart)} - {formatDate(movie.screeningEnd)}
                  </p>
                </div>
              </div>
            )}

            {formError && (
              <Alert variant="danger" onClose={() => setFormError('')} dismissible>
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                required
                min={movie?.screeningStart}
                max={movie?.screeningEnd}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start time</Form.Label>
              <Form.Control
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Room ID</Form.Label>
              <Form.Control
                type="number"
                required
                min={1}
                value={form.roomId}
                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              />
              <Form.Text className="text-muted">
                Temporary numeric input — no Room list API yet to show a proper dropdown.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

const s = {
  movieInfoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 20,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 20,
    marginBottom: 28,
    position: 'relative',
  },
  poster: {
    width: 110,
    height: 155,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  movieMeta: { flex: 1 },
  movieTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 10px',
  },
  metaRow: {
    fontSize: 14,
    color: '#374151',
    margin: '4px 0',
  },
  metaLabel: {
    fontWeight: 500,
    color: '#6b7280',
    marginRight: 6,
  },
  addBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    background: 'transparent',
    border: 'none',
    color: '#6d28d9',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
  modalMovieInfo: {
    display: 'flex',
    gap: 12,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalPoster: {
    width: 56,
    height: 80,
    objectFit: 'cover',
    borderRadius: 4,
    flexShrink: 0,
  },
  modalMovieTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 4px',
  },
  modalMovieMeta: {
    fontSize: 12,
    color: '#6b7280',
    margin: '2px 0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 16,
  },
  scheduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  dateGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#6d28d9',
    margin: '0 0 4px',
    paddingBottom: 6,
    borderBottom: '1px solid #e5e7eb',
  },
  showtimeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  showtimeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  timeRange: {
    fontSize: 13,
    color: '#6b7280',
    minWidth: 110,
    fontWeight: 500,
  },
  showtimeCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '8px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 220,
  },
  showtimeTime: {
    fontWeight: 600,
    color: '#111827',
    fontSize: 13,
  },
  showtimeInfo: {
    color: '#6b7280',
    fontSize: 12,
  },
  statusBadge: {
    UPCOMING: { color: '#6d28d9', fontWeight: 600 },
    SHOWING: { color: '#059669', fontWeight: 600 },
    ENDED: { color: '#9ca3af', fontWeight: 600 },
  },
}
