import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Spinner } from 'react-bootstrap'
import StaffSideBar from '../components/StaffSideBar'
import { getMovieRaw, createMovie, updateMovie } from '../services/movieService'
import { getGenres } from '../services/genreService'
import { uploadImage } from '@/shared/services/uploadService'
import { BASE_URL } from '@/shared/services/axiosClient'

const emptyForm = {
  title: '',
  status: 'COMING_SOON',
  durationMinutes: '',
  releaseDate: '',
  endDate: '',
  language: '',
  director: '',
  description: '',
  cast: '',
  rating: '',
  posterUrl: '',
  bannerUrl: '',
  trailerUrl: '',
}

export default function MovieFormPage() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(movieId)

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({ poster: false, banner: false })
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const [allGenres, setAllGenres] = useState([])
  const [genreIds, setGenreIds] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [genreError, setGenreError] = useState('')

  useEffect(() => {
    getGenres()
      .then((res) => setAllGenres(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let mounted = true
    getMovieRaw(movieId)
      .then((data) => {
        if (!mounted) return
        setForm({
          title: data.title || '',
          status: data.status || 'COMING_SOON',
          durationMinutes: data.durationMinutes ?? '',
          releaseDate: data.releaseDate || '',
          endDate: data.endDate || '',
          language: data.language || '',
          director: data.director || '',
          description: data.description || '',
          cast: data.cast || '',
          rating: data.rating ?? '',
          posterUrl: data.posterUrl || '',
          bannerUrl: data.bannerUrl || '',
          trailerUrl: data.trailerUrl || '',
        })
        if (data.genres) setGenreIds(data.genres.map((g) => g.id))
      })
      .catch((err) => {
        if (mounted) {
          setIsError(true)
          setMessage(`Failed to load movie: ${err.message}`)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [movieId, isEdit])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleUpload(field, file) {
    if (!file) return
    setUploading((prev) => ({ ...prev, [field]: true }))
    try {
      const response = await uploadImage(file)
      set(field === 'poster' ? 'posterUrl' : 'bannerUrl', response.data.url)
    } catch (err) {
      setIsError(true)
      setMessage(`Failed to upload ${field}: ${err.message}`)
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const payload = {
      title: form.title,
      status: form.status,
      durationMinutes: Number(form.durationMinutes),
      releaseDate: form.releaseDate || null,
      endDate: form.endDate || null,
      language: form.language || null,
      director: form.director || null,
      description: form.description || null,
      cast: form.cast || null,
      rating: form.rating ? Number(form.rating) : null,
      posterUrl: form.posterUrl || null,
      bannerUrl: form.bannerUrl || null,
      trailerUrl: form.trailerUrl || null,
      genreIds: genreIds,
    }

    try {
      if (isEdit) {
        await updateMovie(movieId, payload)
        setMessage('Movie updated successfully.')
      } else {
        const res = await createMovie(payload)
        setMessage('Movie created successfully.')
        setTimeout(() => navigate(`/staff/movies/${res.data.id}`), 1000)
      }
      setIsError(false)
    } catch (err) {
      setIsError(true)
      setMessage(err.response?.data || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        <StaffSideBar />
        <main className="flex-grow-1 p-4">
          <div className="text-muted">Loading movie data...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <StaffSideBar />
      <main className="flex-grow-1 p-4" style={{ background: '#f3f4f6' }}>
        <div style={s.card}>
          <div style={s.header}>
            <h1 style={s.headerTitle}>
              <svg style={s.filmIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5" />
              </svg>
              {isEdit ? 'EDIT MOVIE' : 'MOVIE CONFIGURATION'}
            </h1>
            <button style={s.backBtn} onClick={() => navigate('/staff/movies')}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Movie List
            </button>
          </div>

          {message && (
            <Alert variant={isError ? 'danger' : 'success'} onClose={() => setMessage('')} dismissible>
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div style={s.row2}>
              <div>
                <label style={s.fieldLabel}>MOVIE TITLE <span style={s.req}>*</span></label>
                <input type="text" style={s.input} required
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)} />
              </div>
              <div>
                <label style={s.fieldLabel}>SYSTEM STATUS <span style={s.req}>*</span></label>
                <select style={s.input} value={form.status}
                  onChange={(e) => set('status', e.target.value)}>
                  <option value="COMING_SOON">Coming Soon</option>
                  <option value="NOW_SHOWING">Now Showing</option>
                  <option value="ENDED">Ended</option>
                </select>
              </div>
            </div>

            <div style={s.row4}>
              <div>
                <label style={s.fieldLabel}>DURATION (MINS) <span style={s.req}>*</span></label>
                <input type="number" style={s.input} required min={1}
                  value={form.durationMinutes}
                  onChange={(e) => set('durationMinutes', e.target.value)} />
              </div>
              <div>
                <label style={s.fieldLabel}>RELEASE DATE <span style={s.req}>*</span></label>
                <input type="date" style={s.input}
                  value={form.releaseDate}
                  onChange={(e) => set('releaseDate', e.target.value)} />
              </div>
              <div>
                <label style={s.fieldLabel}>END DATE</label>
                <input type="date" style={s.input}
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)} />
              </div>
              <div>
                <label style={s.fieldLabel}>LANGUAGE</label>
                <input type="text" style={s.input}
                  value={form.language}
                  onChange={(e) => set('language', e.target.value)} />
              </div>
            </div>

            <div style={s.row2}>
              <div>
                <label style={s.fieldLabel}>DIRECTOR</label>
                <input type="text" style={s.input}
                  value={form.director}
                  onChange={(e) => set('director', e.target.value)} />
              </div>
              <div>
                <label style={s.fieldLabel}>TMDB RATING (0-10)</label>
                <input type="number" step="0.1" min="0" max="10" style={s.input}
                  value={form.rating}
                  onChange={(e) => set('rating', e.target.value)} />
              </div>
            </div>

            <div style={s.row2}>
              <div>
                <label style={s.fieldLabel}>SYNOPSIS / DESCRIPTION <span style={s.req}>*</span></label>
                <textarea style={{ ...s.input, minHeight: 120, resize: 'vertical' }} rows={4}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)} />
              </div>
              <div>
                <label style={s.fieldLabel}>CAST / ACTORS</label>
                <input type="text" style={s.input}
                  placeholder="e.g. Actor A, Actor B, Actor C"
                  value={form.cast}
                  onChange={(e) => set('cast', e.target.value)} />
                <div style={{ marginTop: 16 }}>
                  <div style={s.fieldLabel}>TRAILER</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                    Enter YouTube URL in the media section below.
                  </div>
                </div>
              </div>
            </div>

            <div style={s.categoriesBox}>
              <div style={s.catGrid}>
                <div>
                  <div style={s.catTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" /></svg>
                    LOCAL CATEGORIES <span style={s.req}>*</span>
                  </div>
                  <div style={s.catRow}>
                    <select value={selectedGenre}
                      onChange={(e) => {
                        setSelectedGenre(e.target.value)
                        setGenreError('')
                      }}>
                      <option value="">-- Select a category to tag --</option>
                      {allGenres.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <button type="button" style={s.addBtn}
                      onClick={() => {
                        const id = Number(selectedGenre)
                        if (!id) {
                          setGenreError('Please select a category first.')
                          return
                        }
                        if (genreIds.includes(id)) {
                          setGenreError('Category already added.')
                          return
                        }
                        setGenreIds((prev) => [...prev, id])
                        setSelectedGenre('')
                        setGenreError('')
                      }}>+</button>
                    {genreError && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{genreError}</div>}
                  </div>
                </div>
                <div>
                  <div style={s.tagsTitle}>SELECTED TAGS:</div>
                  <div style={s.tagsBox}>
                    {genreIds.length === 0 ? (
                      'No categories selected yet.'
                    ) : (
                      genreIds.map((id) => {
                        const g = allGenres.find((x) => x.id === id)
                        return (
                          <span key={id} style={s.tagChip}>
                            {g?.name || id}
                            <button type="button" style={s.tagRemove}
                              onClick={() => setGenreIds((prev) => prev.filter((x) => x !== id))}>&times;</button>
                          </span>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={s.sectionTitle}>
              <span style={s.bar}></span>Media & Visual Assets
            </div>

            <div style={s.mediaGrid}>
              <MediaCard
                label="BANNER (HORIZONTAL)"
                color="#2563eb"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                  </svg>
                }
                uploading={uploading.banner}
                imageUrl={form.bannerUrl}
                onUpload={(file) => handleUpload('banner', file)}
              />
              <MediaCard
                label="POSTER (VERTICAL)"
                color="#2563eb"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                  </svg>
                }
                uploading={uploading.poster}
                imageUrl={form.posterUrl}
                onUpload={(file) => handleUpload('poster', file)}
              />
              <MediaCardTrailer
                url={form.trailerUrl}
                onUrlChange={(val) => set('trailerUrl', val)}
              />
            </div>

            <div style={s.footer}>
              <button type="button" style={s.btnCancel} onClick={() => navigate('/staff/movies')}>
                CANCEL
              </button>
              <button type="submit" style={s.btnSave} disabled={saving}>
                {saving ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M12 16V8M8 12l4-4 4 4" /><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
                  </svg>
                )}
                {isEdit ? 'UPDATE MOVIE' : 'SAVE MOVIE TO DATABASE'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

function MediaCard({ label, color, icon, uploading, imageUrl, onUpload }) {
  const [fileName, setFileName] = useState('')

  function handleChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    onUpload(file)
  }

  return (
    <div style={s.mediaCard}>
      <div style={{ ...s.mediaLabel, color }}>
        {icon}
        {label}
      </div>
      <div style={s.fileInput}>
        <label style={s.chooseBtn}>
          Chọn tệp
          <input type="file" accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleChange} disabled={uploading}
            style={{ display: 'none' }} />
        </label>
        <div style={s.fname}>{fileName || 'Không có tệp… được chọn'}</div>
      </div>
      <div style={s.preview}>
        {uploading ? (
          <div style={{ padding: 16, textAlign: 'center' }}>
            <Spinner animation="border" size="sm" />
          </div>
        ) : imageUrl ? (
          <>
            <div style={s.readyLabel}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" />
              </svg>
              {label.startsWith('BANNER') ? 'Banner' : 'Poster'} Ready
            </div>
            <div style={{ padding: '0 12px 12px' }}>
              <img src={imageUrl.startsWith('http') ? imageUrl : BASE_URL + imageUrl}
                alt={label} style={{ width: '100%', display: 'block', borderRadius: 4 }} />
            </div>
          </>
        ) : (
          <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            No image uploaded yet.
          </div>
        )}
      </div>
    </div>
  )
}

function MediaCardTrailer({ url, onUrlChange }) {
  const videoId = url ? extractYoutubeId(url) : null

  return (
    <div style={s.mediaCard}>
      <div style={{ ...s.mediaLabel, color: '#dc2626' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M10 15.5l6-3.5-6-3.5v7z" />
          <path d="M21.6 7.2c-.2-.9-1-1.6-1.9-1.8C17.9 5 12 5 12 5s-5.9 0-7.7.4c-.9.2-1.7.9-1.9 1.8C2 9 2 12 2 12s0 3 .4 4.8c.2.9 1 1.6 1.9 1.8C6.1 19 12 19 12 19s5.9 0 7.7-.4c.9-.2 1.7-.9 1.9-1.8.4-1.8.4-4.8.4-4.8s0-3-.4-4.8z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        TRAILER VIDEO
      </div>

      <input type="text" style={{ ...s.input, marginBottom: 12, fontSize: 13 }}
        placeholder="Paste YouTube URL here..."
        value={url}
        onChange={(e) => onUrlChange(e.target.value)} />

      <div style={s.preview}>
        {videoId ? (
          <div style={{ padding: 12 }}>
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111', borderRadius: 6, overflow: 'hidden' }}>
              <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt="Trailer thumbnail"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
              <a href={url} target="_blank" rel="noopener noreferrer" style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 54, height: 54, background: '#e11d1d', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
              }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" style={{ marginLeft: 3 }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </a>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', zIndex: 2,
              }}>
                <div style={{
                  width: 34, height: 24, background: '#e11d1d', borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Watch Trailer</div>
                  <div style={{ color: '#d1d5db', fontSize: 11 }}>YouTube</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            Paste a YouTube URL above to preview.
          </div>
        )}
      </div>
    </div>
  )
}

function extractYoutubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

const s = {
  card: {
    maxWidth: 1400, margin: '0 auto', background: '#fff',
    borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)',
    padding: '32px 40px 40px',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 18, borderBottom: '2px solid #16a34a', marginBottom: 28,
  },
  headerTitle: {
    display: 'flex', alignItems: 'center', gap: 12, fontSize: 22,
    letterSpacing: '0.3px', margin: 0, fontWeight: 800, color: '#111827',
  },
  filmIcon: { width: 26, height: 26, color: '#16a34a' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 8, background: '#fff',
    border: '1px solid #d1d5db', color: '#111827', fontWeight: 600, fontSize: 14,
    padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
  },
  fieldLabel: {
    display: 'block', fontSize: 12, fontWeight: 700, color: '#374151',
    letterSpacing: '0.04em', marginBottom: 8,
  },
  req: { color: '#dc2626' },
  input: {
    width: '100%', padding: '11px 14px', background: '#f9fafb',
    border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14,
    color: '#111827', fontFamily: 'inherit', outline: 'none',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 22 },
  row4: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 24, marginBottom: 22 },
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: 12,
    fontSize: 18, fontWeight: 700, color: '#111827', margin: '36px 0 20px',
  },
  bar: { width: 4, height: 22, background: '#16a34a', borderRadius: 2 },
  mediaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 },
  mediaCard: {
    border: '1px dashed #cbd5e1', borderRadius: 12, padding: 18, background: '#fafbfc',
  },
  mediaLabel: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, marginBottom: 12,
  },
  fileInput: {
    display: 'flex', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden',
    fontSize: 13, marginBottom: 14, background: '#fff',
  },
  chooseBtn: {
    background: '#f3f4f6', padding: '8px 14px', borderRight: '1px solid #d1d5db',
    fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', fontSize: 13,
  },
  fname: {
    padding: '8px 12px', color: '#6b7280', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13,
  },
  preview: {
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden',
  },
  readyLabel: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    color: '#15803d', fontSize: 13, fontWeight: 600, padding: '10px 0 6px',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: 14,
    marginTop: 36, paddingTop: 24, borderTop: '1px solid #e5e7eb',
  },
  btnCancel: {
    padding: '12px 26px', borderRadius: 8, fontSize: 14, fontWeight: 700,
    cursor: 'pointer', border: '1px solid #d1d5db', background: '#fff', color: '#111827',
  },
  btnSave: {
    padding: '12px 26px', borderRadius: 8, fontSize: 14, fontWeight: 700,
    cursor: 'pointer', border: 'none', background: '#16a34a', color: '#fff',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  categoriesBox: {
    background: '#f8fafc', border: '1px solid #e5e7eb',
    borderRadius: 12, padding: '20px 24px', marginBottom: 32,
  },
  catGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start',
  },
  catTitle: {
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
    fontWeight: 700, color: '#166534', marginBottom: 10,
  },
  tagsTitle: {
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
    fontWeight: 700, color: '#111827', marginBottom: 10,
  },
  catRow: { display: 'flex', gap: 10 },
  addBtn: {
    background: '#16a34a', border: 'none', color: '#fff', width: 42,
    borderRadius: 8, fontSize: 20, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tagsBox: {
    background: '#fff', border: '1px solid #d1d5db', borderRadius: 8,
    minHeight: 44, padding: '11px 14px', color: '#9ca3af', fontSize: 14,
    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
  },
  tagChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 600,
    padding: '4px 10px', borderRadius: 999,
  },
  tagRemove: {
    background: 'none', border: 'none', color: '#166534',
    cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0,
  },
}
