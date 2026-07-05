import { Routes, Route, Navigate } from 'react-router-dom'
import ViewListOfScreeningMovies from '@/features/staff/pages/ViewListOfScreeningMovies'
import MovieScheduleDetail from '@/features/staff/pages/MovieScheduleDetail'
import AdminMovieManagement from '@/features/admin/pages/AdminMovieManagement'
import AdminUserManagement from '@/features/admin/pages/AdminUserManagement'
import AdminConcessionManagement from '@/features/admin/pages/AdminConcessionManagement'

function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/staff/movies" replace />} />

      {/* Staff Routes */}
      <Route path="/staff/movies" element={<ViewListOfScreeningMovies />} />
      <Route path="/staff/movies/:movieId" element={<MovieScheduleDetail />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<Navigate to="/admin/movies" replace />} />
      <Route path="/admin/movies" element={<AdminMovieManagement />} />
      <Route path="/admin/users" element={<AdminUserManagement />} />
      <Route path="/admin/concessions" element={<AdminConcessionManagement />} />
    </Routes>
  )
}

export default App
