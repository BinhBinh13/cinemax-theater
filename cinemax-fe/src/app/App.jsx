import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CustomerLayout from '@/shared/components/CustomerLayout'
import HomePage from '@/features/customer/pages/HomePage'
import MovieListPage from '@/features/customer/pages/MovieListPage'
import MovieDetailPage from '@/features/customer/pages/MovieDetailPage'
import BookingPage from '@/features/customer/pages/BookingPage'
import PaymentCallbackPage from '@/features/customer/pages/PaymentCallbackPage'

import ViewListOfScreeningMovies from '@/features/staff/pages/ViewListOfScreeningMovies'
import MovieScheduleDetail from '@/features/staff/pages/MovieScheduleDetail'
import FoodDrinkListPage from '@/features/staff/pages/FoodDrinkListPage'
import MovieFormPage from '@/features/staff/pages/MovieFormPage'
import RoomListPage from '@/features/staff/pages/RoomListPage'
import RoomDetailPage from '@/features/staff/pages/RoomDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MovieListPage />} />
          <Route path="/movies/:movieId" element={<MovieDetailPage />} />
          <Route path="/booking/:scheduleId" element={<BookingPage />} />
          <Route path="/payment-callback" element={<PaymentCallbackPage />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<Navigate to="/staff/movies" replace />} />
        <Route path="/staff/movies/new" element={<MovieFormPage />} />
        <Route path="/staff/movies/:movieId/edit" element={<MovieFormPage />} />
        <Route path="/staff/movies/:movieId" element={<MovieScheduleDetail />} />
        <Route path="/staff/movies" element={<ViewListOfScreeningMovies />} />
        <Route path="/staff/food-drinks" element={<FoodDrinkListPage />} />
        <Route path="/staff/rooms" element={<RoomListPage />} />
        <Route path="/staff/rooms/:roomId" element={<RoomDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
