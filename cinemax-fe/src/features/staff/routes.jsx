import { Routes, Route, Navigate } from 'react-router-dom'
import ViewListOfScreeningMovies from './pages/ViewListOfScreeningMovies'
import MovieScheduleDetail from './pages/MovieScheduleDetail'
import FoodDrinkListPage from './pages/FoodDrinkListPage'
import MovieFormPage from './pages/MovieFormPage'
import RoomListPage from './pages/RoomListPage'
import RoomDetailPage from './pages/RoomDetailPage'

const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff/movies" replace />} />
      <Route path="/staff/movies/new" element={<MovieFormPage />} />
      <Route path="/staff/movies/:movieId/edit" element={<MovieFormPage />} />
      <Route path="/staff/movies/:movieId" element={<MovieScheduleDetail />} />
      <Route path="/staff/movies" element={<ViewListOfScreeningMovies />} />
      <Route path="/staff/food-drinks" element={<FoodDrinkListPage />} />
      <Route path="/staff/rooms" element={<RoomListPage />} />
      <Route path="/staff/rooms/:roomId" element={<RoomDetailPage />} />
    </Routes>
  )
}

export default StaffRoutes