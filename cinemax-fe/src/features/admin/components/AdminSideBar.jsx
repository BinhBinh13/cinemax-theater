import { NavLink } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'

const navItems = [
  { label: 'Quản lý Người dùng', to: '/admin/users' },
]

const styles = {
  sidebar: {
    width: 220,
    minHeight: '100vh',
    flexShrink: 0,
    background: '#f8f9fa',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 16px',
    borderBottom: '1px solid #e5e7eb',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#e50914',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 14,
    flexShrink: 0,
  },
  username: {
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
  },
  role: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
  },
  nav: {
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flexGrow: 1,
  },
  logoutContainer: {
    marginTop: 'auto',
    padding: '16px 8px',
    borderTop: '1px solid #e5e7eb',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(229, 9, 20, 0.08)',
    border: '1px solid rgba(229, 9, 20, 0.15)',
    color: '#e50914',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
  }
}

export default function AdminSideBar({ username = 'Admin', role = 'Admin' }) {
  const { user, logout } = useAuth()

  const displayUsername = user?.fullName || user?.username || username
  const displayRole = user?.roles
    ? user.roles.map((r) => r.replace('ROLE_', '')).join(', ')
    : role

  return (
    <div style={styles.sidebar}>
      <div style={styles.userBox}>
        <div style={styles.avatar}>{displayUsername.charAt(0).toUpperCase()}</div>
        <div>
          <div style={styles.username}>{displayUsername}</div>
          <div style={styles.role}>{displayRole}</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'block',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#e50914' : '#374151',
              background: isActive ? 'rgba(229, 9, 20, 0.08)' : 'transparent',
              textDecoration: 'none',
              transition: 'background 0.15s',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.logoutContainer}>
        <button
          style={styles.logoutBtn}
          onClick={logout}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#e50914'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(229, 9, 20, 0.08)'
            e.currentTarget.style.color = '#e50914'
          }}
        >
          Đăng Xuất
        </button>
      </div>
    </div>
  )
}
