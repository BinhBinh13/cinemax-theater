import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'

const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [localLoading, setLocalLoading] = useState(false)

  const { register, error: authError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    setSuccessMessage('')

    // Client-side validations
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setValidationError('Vui lòng điền đầy đủ các thông tin bắt buộc.')
      return
    }
    if (username.length < 3) {
      setValidationError('Tên đăng nhập phải có ít nhất 3 ký tự.')
      return
    }
    if (password.length < 6) {
      setValidationError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Mật khẩu nhập lại không khớp.')
      return
    }

    setLocalLoading(true)
    try {
      await register(username, email, password, fullName, phone)
      setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...')
      
      // Clear inputs
      setUsername('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFullName('')
      setPhone('')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      console.error('Registration error:', err)
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="cinema-bg d-flex justify-content-center align-items-center p-3 py-5">
      <div className="glass-card p-4 p-md-5 w-100" style={{ maxWidth: '500px' }}>
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="cinema-logo text-danger m-0 mb-2" style={{ fontSize: '32px' }}>
            CINE<span className="text-gold">MAX</span>
          </h1>
          <p className="text-secondary small">Hệ Thống Quản Lý Rạp Chiếu Phim Cao Cấp</p>
        </div>

        <h3 className="text-center mb-4 fw-normal">Đăng Ký Tài Khoản</h3>

        {/* Message Alerts */}
        {validationError && (
          <Alert variant="danger" className="py-2 small border-0 bg-danger bg-opacity-25 text-danger">
            {validationError}
          </Alert>
        )}
        {authError && !validationError && (
          <Alert variant="danger" className="py-2 small border-0 bg-danger bg-opacity-25 text-danger">
            {authError}
          </Alert>
        )}
        {successMessage && (
          <Alert variant="success" className="py-2 small border-0 bg-success bg-opacity-25 text-success">
            {successMessage}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Username */}
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label className="small text-secondary">Tên đăng nhập <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="cinema-input py-2"
              disabled={localLoading || !!successMessage}
              required
            />
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label className="small text-secondary">Địa chỉ Email <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              placeholder="Nhập địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cinema-input py-2"
              disabled={localLoading || !!successMessage}
              required
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="small text-secondary">Mật khẩu <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cinema-input py-2"
              disabled={localLoading || !!successMessage}
              required
            />
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label className="small text-secondary">Nhập lại mật khẩu <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập lại mật khẩu để xác nhận"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="cinema-input py-2"
              disabled={localLoading || !!successMessage}
              required
            />
          </Form.Group>

          <hr className="my-4 border-secondary opacity-25" />

          {/* Full Name */}
          <Form.Group className="mb-3" controlId="formFullName">
            <Form.Label className="small text-secondary">Họ và tên</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập họ và tên đầy đủ"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="cinema-input py-2"
              disabled={localLoading || !!successMessage}
            />
          </Form.Group>

          {/* Phone */}
          <Form.Group className="mb-4" controlId="formPhone">
            <Form.Label className="small text-secondary">Số điện thoại</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="cinema-input py-2"
              disabled={localLoading || !!successMessage}
            />
          </Form.Group>

          <Button
            variant="danger"
            type="submit"
            className="neon-btn w-100 py-2.5 mb-3"
            disabled={localLoading || !!successMessage}
          >
            {localLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang đăng ký...
              </>
            ) : (
              'Đăng Ký'
            )}
          </Button>
        </Form>

        {/* Footer */}
        <div className="text-center mt-4 small text-secondary">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-gold text-decoration-none hover-underline fw-bold">
            Đăng nhập ngay
          </Link>
        </div>

      </div>
    </div>
  )
}

export default RegisterPage
