import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import { useLanguage } from '@/app/providers/LanguageProvider'
import CustomerHeader from '@/shared/components/CustomerHeader'
import Container from 'react-bootstrap/Container'
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
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    setSuccessMessage('')

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
      setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng...')
      
      setUsername('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFullName('')
      setPhone('')

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
    <div className="cinemax-page-container d-flex flex-column">
      <CustomerHeader />

      <main className="flex-grow-1 py-5 d-flex align-items-center justify-content-center">
        <Container style={{ maxWidth: '550px' }}>
          
          <div className="cinemax-auth-wrapper shadow">
            {/* Header Tabs */}
            <div className="cinemax-auth-header">
              <div className="d-flex justify-content-center gap-4">
                <Link to="/login" className="text-white-50 fw-bold fs-5 text-decoration-none hover-white">
                  {t('loginBtn')}
                </Link>
                <Link to="/register" className="text-white fw-bold fs-5 text-decoration-none border-bottom border-white border-2 pb-1">
                  {t('registerBtn')}
                </Link>
              </div>
            </div>

            <div className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h3 className="fw-black text-dark m-0">{t('createAccountTitle')}</h3>
                <p className="small text-secondary">{t('createAccountDesc')}</p>
              </div>

              {/* Message Alerts */}
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
              {successMessage && (
                <Alert variant="success" className="py-2 small border-0 bg-success bg-opacity-10 text-success fw-semibold">
                  {successMessage}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label className="small fw-bold text-dark">{t('usernameOrEmail')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="py-2 border-dark"
                    disabled={localLoading || !!successMessage}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label className="small fw-bold text-dark">Email *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-2 border-dark"
                    disabled={localLoading || !!successMessage}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label className="small fw-bold text-dark">{t('password')}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-2 border-dark"
                    disabled={localLoading || !!successMessage}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label className="small fw-bold text-dark">{t('confirmPassword')}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="py-2 border-dark"
                    disabled={localLoading || !!successMessage}
                    required
                  />
                </Form.Group>

                <hr className="my-3" />

                <Form.Group className="mb-3" controlId="formFullName">
                  <Form.Label className="small fw-bold text-dark">{t('fullName')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="py-2 border-dark"
                    disabled={localLoading || !!successMessage}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPhone">
                  <Form.Label className="small fw-bold text-dark">{t('phone')}</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="py-2 border-dark"
                    disabled={localLoading || !!successMessage}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 py-2.5 mb-3 fw-bold uppercase shadow-sm"
                  style={{ background: '#e50914', borderColor: '#b80710' }}
                  disabled={localLoading || !!successMessage}
                >
                  {localLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Registering...
                    </>
                  ) : (
                    t('registerBtn')
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3 small text-secondary">
                {t('alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-danger fw-bold text-decoration-none">
                  {t('loginNow')}
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

export default RegisterPage
