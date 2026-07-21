import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  
  const { login, error: authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    
    if (!usernameOrEmail.trim()) {
      setValidationError('Vui lòng nhập tài khoản hoặc email.')
      return
    }
    if (!password) {
      setValidationError('Vui lòng nhập mật khẩu.')
      return
    }

    setLocalLoading(true)
    try {
      const loggedInUser = await login(usernameOrEmail, password)

      // If the user was redirected here from a protected page (e.g. booking a
      // seat), send them back there instead of the role-based default.
      if (location.state?.from) {
        navigate(from, { replace: true })
        return
      }

      // Redirect based on roles
      const roles = loggedInUser.roles || []
      const isStaffOrAdmin = roles.some(role =>
        role.toUpperCase() === 'ROLE_STAFF' || role.toUpperCase() === 'ROLE_ADMIN'
      )

      if (isStaffOrAdmin) {
        navigate('/staff/movies', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      // Errors are handled in AuthContext and populated in authError
      console.error('Login error:', err)
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="cinema-bg d-flex justify-content-center align-items-center p-3">
      <div className="glass-card p-4 p-md-5 w-100" style={{ maxWidth: '450px' }}>
        
        {/* Logo and Header */}
        <div className="text-center mb-4">
          <h1 className="cinema-logo text-danger m-0 mb-2" style={{ fontSize: '32px' }}>
            CINE<span className="text-gold">MAX</span>
          </h1>
          <p className="text-secondary small">Hệ Thống Quản Lý Rạp Chiếu Phim Cao Cấp</p>
        </div>

        <h3 className="text-center mb-4 fw-normal">Đăng Nhập</h3>

        {/* Error Alerts */}
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

        {/* Login Form */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formUsernameOrEmail">
            <Form.Label className="small text-secondary">Tài khoản hoặc Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên đăng nhập hoặc email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="cinema-input py-2"
              disabled={localLoading}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formPassword">
            <Form.Label className="small text-secondary">Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cinema-input py-2"
              disabled={localLoading}
            />
          </Form.Group>

          <Button 
            variant="danger" 
            type="submit" 
            className="neon-btn w-100 py-2.5 mb-3"
            disabled={localLoading}
          >
            {localLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xác thực...
              </>
            ) : (
              'Đăng Nhập'
            )}
          </Button>
        </Form>

        {/* Footer Actions */}
        <div className="text-center mt-4 small text-secondary">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-gold text-decoration-none hover-underline fw-bold">
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  )
}

export default LoginPage
