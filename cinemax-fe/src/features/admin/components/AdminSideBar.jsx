import { NavLink } from "react-router-dom";
import "../styles/AdminDashboard.css";

export default function AdminSideBar() {
  return (
    <div className="admin-sidebar d-flex flex-column p-3 bg-dark text-white min-vh-100" style={{ width: '260px' }}>
      <div className="text-center mb-4 border-bottom border-secondary pb-3">
        <h4 className="cinema-logo text-danger fw-bold m-0" style={{ fontSize: '20px' }}>CINEMAX ADMIN</h4>
        <span className="badge bg-danger mt-1">CỔNG QUẢN TRỊ VIỆN</span>
      </div>

      <div className="d-flex flex-column gap-2 flex-grow-1">
        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => isActive ? "btn btn-danger text-start fw-bold shadow-sm" : "btn btn-outline-light text-start"}
        >
          👨‍💼 Quản lý Nhân viên & Khách hàng
        </NavLink>
      </div>

      <div className="mt-auto pt-3 border-top border-secondary">
        <a href="/login" className="btn btn-sm btn-outline-danger w-100 fw-bold" onClick={() => localStorage.clear()}>
          🚪 Đăng xuất Admin
        </a>
      </div>
    </div>
  );
}
