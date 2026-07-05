import { NavLink } from "react-router-dom";
import "../styles/AdminDashboard.css";

export default function AdminSideBar() {
  return (
    <div className="admin-sidebar d-flex flex-column">
      <h4 className="text-warning mb-4 text-center">CINEMAX ADMIN</h4>
      <div className="d-flex flex-column gap-2 flex-grow-1">
        <NavLink to="/admin/movies" className={({ isActive }) => isActive ? "active" : ""}>
          🎬 Quản lý Phim
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "active" : ""}>
          👥 Quản lý Nhân viên
        </NavLink>
        <NavLink to="/admin/concessions" className={({ isActive }) => isActive ? "active" : ""}>
          🍿 Đồ ăn & Nước uống
        </NavLink>
      </div>
      <div className="mt-auto pt-3 border-top border-secondary">
        <a href="/" className="btn btn-sm btn-danger w-100" onClick={() => localStorage.clear()}>
          Đăng xuất
        </a>
      </div>
    </div>
  );
}
