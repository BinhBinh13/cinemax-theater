import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import { useLanguage } from '@/app/providers/LanguageProvider'
import CustomerHeader from '@/shared/components/CustomerHeader'
import Container from 'react-bootstrap/Container'
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
  const { t } = useLanguage()
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

      // Redirect based on roles (ADMIN takes priority over STAFF)
      const roles = loggedInUser.roles || []
      const isAdmin = roles.some((role) => {
        const r = typeof role === 'string' ? role.toUpperCase().replace('ROLE_', '') : ''
        return r === 'ADMIN'
      })
      const isStaff = roles.some((role) => {
        const r = typeof role === 'string' ? role.toUpperCase().replace('ROLE_', '') : ''
        return r === 'STAFF'
      })

      if (isAdmin) {
        navigate('/admin/users', { replace: true })
      } else if (isStaff) {
        navigate('/staff/movies', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="cinemax-page-container d-flex flex-column">
      <CustomerHeader />

      <main className="flex-grow-1 py-5 d-flex align-items-center justify-content-center">
        <Container style={{ maxWidth: '500px' }}>

          <div className="cinemax-auth-wrapper shadow">
            {/* Header Tabs */}
            <div className="cinemax-auth-header">
              <div className="d-flex justify-content-center gap-4">
                <Link to="/login" className="text-white fw-bold fs-5 text-decoration-none border-bottom border-white border-2 pb-1">
                  {t('loginBtn')}
                </Link>
                <Link to="/register" className="text-white-50 fw-bold fs-5 text-decoration-none hover-white">
                  {t('registerBtn')}
                </Link>
              </div>
            </div>

            <div className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h3 className="fw-black text-dark m-0">{t('loginTitle')}</h3>
                <p className="small text-secondary">{t('loginDesc')}</p>
              </div>

              {/* Error Alerts */}
              {validationError && (
                <Alert variant="danger" className="py-2 small border-0 bg-danger bg-opacity-10 text-danger fw-semibold">
                  {validationError}
                </Alert>
              )}
              {authError && !validationError && (
                <Alert variant="danger" className="py-2 small border-0 bg-danger bg-opacity-10 text-danger fw-semibold">
                  {authError}
                </Alert>
              )}

              {/* Login Form */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsernameOrEmail">
                  <Form.Label className="small fw-bold text-dark">{t('usernameOrEmail')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username or email"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="py-2 border-dark"
                    disabled={localLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label className="small fw-bold text-dark">{t('password')}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-2 border-dark"
                    disabled={localLoading}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 py-2.5 mb-3 fw-bold uppercase shadow-sm"
                  style={{ background: '#e50914', borderColor: '#b80710' }}
                  disabled={localLoading}
                >
                  {localLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Authenticating...
                    </>
                  ) : (
                    t('loginBtn')
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3 small text-secondary">
                {t('noAccountYet')}{' '}
                <Link to="/register" className="text-danger fw-bold text-decoration-none">
                  {t('registerNow')}
                </Link>
              </div>
            </div>
          </div>

        </Container>
      </main>

      {/* CINEMAX Footer */}
      <footer className="cinemax-footer">
        <Container className="text-center">
          <div className="fw-bold mb-1">{t('companyName')}</div>
          <div className="small text-secondary">{t('hotline')}: 1900 1234 | {t('supportEmail')}</div>
        </Container>
      </footer>
    </div>
  )
}

export default LoginPage
