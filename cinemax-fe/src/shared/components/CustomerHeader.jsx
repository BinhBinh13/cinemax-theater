import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import { useLanguage } from '@/app/providers/LanguageProvider'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'

const CustomerHeader = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="cinemax-header-section sticky-top shadow-sm">
      {/* Top Utility Bar */}
      <div className="cinemax-top-utility">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-danger text-white px-2 py-1">CINEMAX</span>
            <span className="small text-secondary fw-semibold d-none d-sm-inline">
              {t('promoNotice')}
            </span>
          </div>

          <div className="d-flex align-items-center gap-4">
            {isAuthenticated ? (
              <Link to="/history" className="text-secondary text-decoration-none">
                🎬 {t('myTickets')}
              </Link>
            ) : null}

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link to="/profile" className="fw-bold text-danger text-decoration-none">
                  {t('hi')}, {user?.fullName || user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-link p-0 text-secondary small text-decoration-none ms-2"
                >
                  [{t('logout')}]
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="text-danger fw-bold text-decoration-none">
                  {t('loginRegister')}
                </Link>
              </div>
            )}

            {/* Language Switcher VN / EN */}
            <div className="border-start ps-3 d-flex gap-1 fw-bold small">
              <button 
                className={`btn btn-link p-0 text-decoration-none small fw-bold ${lang === 'vi' ? 'text-danger' : 'text-secondary'}`}
                onClick={() => setLang('vi')}
              >
                VN
              </button>
              <span className="text-muted">|</span>
              <button 
                className={`btn btn-link p-0 text-decoration-none small fw-bold ${lang === 'en' ? 'text-danger' : 'text-secondary'}`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Perforated Red Filmstrip Line Top */}
      <div className="film-strip-border"></div>

      {/* Main CINEMAX Navbar */}
      <Navbar collapseOnSelect expand="lg" className="cinemax-main-navbar py-2">
        <Container>
          <Navbar.Brand as={Link} to="/" className="cinemax-logo-text me-4">
            CINE<span className="text-gold">MAX</span><span className="cinemax-logo-star">✳</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="cinemax-navbar-nav" />

          <Navbar.Collapse id="cinemax-navbar-nav">
            <Nav className="me-auto align-items-center gap-3">
              {/* PHIM Dropdown */}
              <NavDropdown 
                title={t('movies')} 
                id="cinemax-movies-dropdown"
                className="cinemax-dropdown-nav"
              >
                <NavDropdown.Item as={Link} to="/?status=NOW_SHOWING" className="fw-bold py-2">
                  🎬 {t('nowShowing')}
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/?status=COMING_SOON" className="fw-bold py-2">
                  🍿 {t('comingSoon')}
                </NavDropdown.Item>
              </NavDropdown>

              {/* RẠP CINEMAX link to /theaters */}
              <Nav.Link as={NavLink} to="/theaters" className="cinemax-nav-link">
                {t('theaters')}
              </Nav.Link>
              
              <Nav.Link as={NavLink} to={isAuthenticated ? "/profile" : "/login"} className="cinemax-nav-link">
                {t('membership')}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Perforated Red Filmstrip Line Bottom */}
      <div className="film-strip-border"></div>
    </header>
  )
}

export default CustomerHeader
