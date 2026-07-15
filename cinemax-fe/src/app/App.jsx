import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/app/providers/AuthContext'
import ProtectedRoute from '@/shared/components/ProtectedRoute'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import MovieCatalogPage from '@/features/public/pages/MovieCatalogPage'
import MovieDetailsPage from '@/features/public/pages/MovieDetailsPage'
import SeatingChartPage from '@/features/public/pages/SeatingChartPage'
import BookingHistoryPage from '@/features/public/pages/BookingHistoryPage'
import CustomerProfilePage from '@/features/public/pages/CustomerProfilePage'
import ViewListOfScreeningMovies from '@/features/staff/pages/ViewListOfScreeningMovies'
import MovieScheduleDetail from '@/features/staff/pages/MovieScheduleDetail'
import FoodDrinkListPage from '@/features/staff/pages/FoodDrinkListPage'
import StaffProfilePage from '@/features/staff/pages/StaffProfilePage'

// A wrapper that prevents Staff and Admin users from entering Customer pages
const CustomerRoute = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth()

  if (isAuthenticated && (hasRole('STAFF') || hasRole('ADMIN'))) {
    return <Navigate to="/staff/movies" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest / Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Customer Public Pages */}
          <Route 
            path="/" 
            element={
              <CustomerRoute>
                <MovieCatalogPage />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/movies/:movieId" 
            element={
              <CustomerRoute>
                <MovieDetailsPage />
              </CustomerRoute>
            } 
          />

          {/* Customer Protected Pages */}
          <Route
            path="/booking/:scheduleId"
            element={
              <ProtectedRoute>
                <CustomerRoute>
                  <SeatingChartPage />
                </CustomerRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <CustomerRoute>
                  <BookingHistoryPage />
                </CustomerRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <CustomerRoute>
                  <CustomerProfilePage />
                </CustomerRoute>
              </ProtectedRoute>
            }
          />

          {/* Protected Staff/Admin Routes */}
          <Route
            path="/staff/movies"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <ViewListOfScreeningMovies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/movies/:movieId"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <MovieScheduleDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/food-drinks"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <FoodDrinkListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/profile"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <StaffProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback - redirect to catalog home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
