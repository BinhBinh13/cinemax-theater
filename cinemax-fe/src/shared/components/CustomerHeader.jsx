import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'

const CustomerHeader = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Navbar collapseOnSelect expand="lg" variant="light" style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }} className="py-2.5 sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="cinema-logo text-danger fw-bold fs-3">
          CINE<span className="text-gold">MAX</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto ms-lg-4">
            <Nav.Link
              as={NavLink}
              to="/"
              end
              style={({ isActive }) => ({
                color: isActive ? '#e50914' : '#495057',
                fontWeight: isActive ? '600' : '400',
                transition: 'color 0.2s',
              })}
              className="px-3"
            >
              Phim Đang Chiếu
            </Nav.Link>

            {isAuthenticated && (
              <>
                <Nav.Link
                  as={NavLink}
                  to="/profile"
                  style={({ isActive }) => ({
                    color: isActive ? '#e50914' : '#495057',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'color 0.2s',
                  })}
                  className="px-3"
                >
                  Hồ Sơ Cá Nhân
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="d-flex align-items-center gap-2 text-decoration-none text-dark hover-opacity">
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#e50914',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '14px',
                    }}
                  >
                    {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="small text-secondary d-none d-sm-inline">
                    {user?.fullName || user?.username}
                  </span>
                </Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                  className="px-3 py-1"
                >
                  Đăng Xuất
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-secondary"
                  size="sm"
                  className="px-3 py-1"
                >
                  Đăng Nhập
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="danger"
                  size="sm"
                  className="neon-btn px-4 py-1"
                >
                  Đăng Ký
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default CustomerHeader
