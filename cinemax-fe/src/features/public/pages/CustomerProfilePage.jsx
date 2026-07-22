import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers/AuthContext'
import axiosClient from '@/shared/services/axiosClient'
import CustomerHeader from '@/shared/components/CustomerHeader'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'

const CustomerProfilePage = () => {
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
    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get('/api/v1/users/profile')
        const { username, email, fullName, phone } = response.data
        setFormData({
          username: username || '',
          email: email || '',
          fullName: fullName || '',
          phone: phone || '',
        })
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Không thể tải thông tin hồ sơ của bạn.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
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
      setSuccess('Cập nhật thông tin tài khoản thành công!')
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError(err.message || 'Cập nhật tài khoản thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="cinemax-page-container text-dark min-vh-100 d-flex flex-column">
      <CustomerHeader />

      <main className="flex-grow-1 py-5">
        <Container style={{ maxWidth: '600px' }}>
          
          <div className="mb-4 text-center">
            <h2 className="text-dark fw-bold mb-1">Thông Tin Tài Khoản</h2>
            <p className="text-secondary small">Quản lý và cập nhật thông tin cá nhân của bạn</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" className="mb-3" />
              <div className="text-secondary">Đang tải thông tin...</div>
            </div>
          ) : (
            <Card className="glass-card border-0 p-4">
              <Card.Body>
                
                {error && (
                  <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger mb-4">
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="border-0 bg-success bg-opacity-10 text-success mb-4">
                    🎉 {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Username (Disabled) */}
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label className="small text-secondary fw-semibold">Tên đăng nhập (Username)</Form.Label>
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
                    <Form.Label className="small text-secondary fw-semibold">Họ và tên</Form.Label>
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
                    <Form.Label className="small text-secondary fw-semibold">Địa chỉ Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ email..."
                      className="cinema-input"
                      required
                    />
                  </Form.Group>

                  {/* Phone */}
                  <Form.Group className="mb-4" controlId="formPhone">
                    <Form.Label className="small text-secondary fw-semibold">Số điện thoại</Form.Label>
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
                    className="neon-btn w-100 py-2.5"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang lưu thay đổi...
                      </>
                    ) : (
                      'Lưu Thay Đổi'
                    )}
                  </Button>
                </Form>

              </Card.Body>
            </Card>
          )}

        </Container>
      </main>

      <footer className="cinema-footer py-4 text-center text-secondary small border-top">
        © {new Date().getFullYear()} Cinemax Grand Center. All rights reserved.
      </footer>
    </div>
  )
}

export default CustomerProfilePage
