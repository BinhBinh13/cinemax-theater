import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import axiosInstance from '../../shared/services/axiosInstance'
import axiosClient from '../../shared/services/axiosClient'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from local storage on load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (err) {
        console.error('Failed to load auth data from local storage', err)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (usernameOrEmail, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.post('/auth/login', {
        usernameOrEmail,
        password,
      })

      const { accessToken, username, email, fullName, roles } = response.data
      const userData = { username, email, fullName, roles }

      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(userData))

      setToken(accessToken)
      setUser(userData)
      return userData
    } catch (err) {
      let errMsg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối.'
      if (err.response) {
        if (typeof err.response.data === 'string') {
          errMsg = err.response.data
        } else if (err.response.data && err.response.data.message) {
          errMsg = err.response.data.message
        } else if (err.response.data && err.response.data.error) {
          errMsg = err.response.data.error
        }
      } else if (err.message) {
        errMsg = err.message
      }
      setError(errMsg)
      throw new Error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setError(null)
  }

  // Register function
  const register = async (username, email, password, fullName, phone) => {
    setLoading(true)
    setError(null)
    try {
      await axiosInstance.post('/auth/register', {
        username,
        email,
        password,
        fullName,
        phone,
      })
    } catch (err) {
      let errMsg = 'Đăng ký thất bại. Vui lòng kiểm tra lại kết nối.'
      if (err.response) {
        if (typeof err.response.data === 'string') {
          errMsg = err.response.data
        } else if (err.response.data && err.response.data.message) {
          errMsg = err.response.data.message
        } else if (err.response.data && err.response.data.error) {
          errMsg = err.response.data.error
        }
      } else if (err.message) {
        errMsg = err.message
      }
      setError(errMsg)
      throw new Error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  // Update profile function
  const updateProfile = async (email, fullName, phone) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosClient.put('/api/v1/users/profile', {
        email,
        fullName,
        phone,
      })

      const { username, email: resEmail, fullName: resFullName, phone: resPhone, roles } = response.data
      const userData = { username, email: resEmail, fullName: resFullName, phone: resPhone, roles }

      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (err) {
      let errMsg = 'Cập nhật tài khoản thất bại.'
      if (err.response) {
        if (typeof err.response.data === 'string') {
          errMsg = err.response.data
        } else if (err.response.data && err.response.data.message) {
          errMsg = err.response.data.message
        }
      } else if (err.message) {
        errMsg = err.message
      }
      setError(errMsg)
      throw new Error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  // Check if user has a specific role (ignores 'ROLE_' prefix for flexibility)
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false
    const cleanRoleName = roleName.toUpperCase().replace('ROLE_', '')
    return user.roles.some((r) => r.toUpperCase().replace('ROLE_', '') === cleanRoleName)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      login,
      logout,
      register,
      updateProfile,
      hasRole,
      isAuthenticated: !!token,
    }),
    [user, token, loading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
