import { Routes, Route, Navigate } from "react-router-dom";
import AdminMovieManagement from "./pages/AdminMovieManagement";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminConcessionManagement from "./pages/AdminConcessionManagement";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<Navigate to="/admin/movies" replace />} />
      <Route path="/admin/movies" element={<AdminMovieManagement />} />
      <Route path="/admin/users" element={<AdminUserManagement />} />
      <Route path="/admin/concessions" element={<AdminConcessionManagement />} />
    </Routes>
  );
};

export default AdminRoutes;
