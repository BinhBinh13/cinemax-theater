import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers/AuthContext'
import axiosClient from '@/shared/services/axiosClient'
import StaffSideBar from '../components/StaffSideBar'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import Card from 'react-bootstrap/Card'

const StaffProfilePage = () => {
  const { updateProfile } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    let mounted = true
    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get('/api/v1/users/profile')
        if (mounted) {
          const { username, email, fullName, phone } = response.data
          setFormData({
            username: username || '',
            email: email || '',
            fullName: fullName || '',
            phone: phone || '',
          })
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        if (mounted) setError('Không thể tải thông tin hồ sơ của bạn.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updateProfile(formData.email, formData.fullName, formData.phone)
      setSuccess('Cập nhật hồ sơ nhân viên thành công!')
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError(err.message || 'Cập nhật hồ sơ thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <StaffSideBar />
      <main className="flex-grow-1 p-4 d-flex flex-column justify-content-center align-items-center">
        {loading ? (
          <div className="text-muted">Loading profile details...</div>
        ) : (
          <div className="w-100" style={{ maxWidth: '550px' }}>
            <h4 className="fw-normal mb-4 text-center">Staff Profile</h4>
            <Card className="glass-card border-0 p-4 shadow-sm" style={{ background: '#1c1b29' }}>
              <Card.Body>
                
                {error && (
                  <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger mb-4 small">
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="border-0 bg-success bg-opacity-10 text-success mb-4 small">
                    🎉 {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Username (Disabled) */}
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label className="small text-secondary fw-semibold">Tên đăng nhập</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      disabled
                      className="cinema-input text-secondary-emphasis"
                      style={{ cursor: 'not-allowed' }}
                    />
                  </Form.Group>

                  {/* Full Name */}
                  <Form.Group className="mb-3" controlId="formFullName">
                    <Form.Label className="small text-secondary fw-semibold">Họ và tên nhân viên</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên..."
                      className="cinema-input"
                      required
                    />
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="small text-secondary fw-semibold">Email công việc</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Nhập email..."
                      className="cinema-input"
                      required
                    />
                  </Form.Group>

                  {/* Phone */}
                  <Form.Group className="mb-4" controlId="formPhone">
                    <Form.Label className="small text-secondary fw-semibold">Số điện thoại liên hệ</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại..."
                      className="cinema-input"
                    />
                  </Form.Group>

                  <Button
                    variant="danger"
                    type="submit"
                    className="neon-btn px-5 py-2"
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : 'Cập Nhật Hồ Sơ'}
                  </Button>
                </Form>

              </Card.Body>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default StaffProfilePage
