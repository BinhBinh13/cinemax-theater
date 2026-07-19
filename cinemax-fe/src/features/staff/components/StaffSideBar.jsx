import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Movie List', to: '/staff/movies' },
  { label: 'Food and Drinks', to: '/staff/food-drinks' },
  { label: 'Rooms', to: '/staff/rooms' },
  { label: 'Staff Profile', to: '/staff/profile' },
  { label: 'Home', to: '/' },
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
    background: '#6d28d9',
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
  },
}

export default function StaffSideBar({ username = 'Binh', role = 'Staff' }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.userBox}>
        <div style={styles.avatar}>{username.charAt(0)}</div>
        <div>
          <div style={styles.username}>{username}</div>
          <div style={styles.role}>{role}</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'block',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#6d28d9' : '#374151',
              background: isActive ? '#ede9fe' : 'transparent',
              textDecoration: 'none',
              transition: 'background 0.15s',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}