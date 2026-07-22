import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import MovieCatalogPage from "@/features/public/pages/MovieCatalogPage";
import MovieDetailsPage from "@/features/public/pages/MovieDetailsPage";
import TheaterRoomsPage from "@/features/public/pages/TheaterRoomsPage";
import BookingPage from "@/features/customer/pages/BookingPage";
import PaymentCallbackPage from "@/features/customer/pages/PaymentCallbackPage";
import BookingHistoryPage from "@/features/public/pages/BookingHistoryPage";
import CustomerProfilePage from "@/features/public/pages/CustomerProfilePage";
import ViewListOfScreeningMovies from "@/features/staff/pages/ViewListOfScreeningMovies";
import MovieScheduleDetail from "@/features/staff/pages/MovieScheduleDetail";
import MovieFormPage from "@/features/staff/pages/MovieFormPage";
import FoodDrinkListPage from "@/features/staff/pages/FoodDrinkListPage";
import RoomListPage from "@/features/staff/pages/RoomListPage";
import RoomDetailPage from "@/features/staff/pages/RoomDetailPage";
import StaffProfilePage from "@/features/staff/pages/StaffProfilePage";
import AdminUserManagement from "@/features/admin/pages/AdminUserManagement";

const CustomerRoute = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (isAuthenticated) {
    if (hasRole("ADMIN")) {
      return <Navigate to="/admin/users" replace />;
    }
    if (hasRole("STAFF")) {
      return <Navigate to="/staff/movies" replace />;
    }
  }

  return children;
};

function App() {
  return (
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
        path="/theaters"
        element={
          <CustomerRoute>
            <TheaterRoomsPage />
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
              <BookingPage />
            </CustomerRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-callback"
        element={
          <ProtectedRoute>
            <PaymentCallbackPage />
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
        path="/staff/movies/new"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <MovieFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/movies/:movieId/edit"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <MovieFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/movies/:movieId"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <MovieScheduleDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/movies"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <ViewListOfScreeningMovies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/food-drinks"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <FoodDrinkListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/rooms"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <RoomListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/rooms/:roomId"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <RoomDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/profile"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <StaffProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes (Only ADMIN role) */}
      <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminUserManagement />
          </ProtectedRoute>
        }
      />

      {/* Fallback - redirect to catalog home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
