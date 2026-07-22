import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthContext";
import Spinner from "react-bootstrap/Spinner";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading, hasRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light text-dark"
        style={{ height: "100vh", width: "100vw" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="danger"
            role="status"
            className="mb-2"
          />
          <div>Đang tải thông tin xác thực...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User has roles but none of them are allowed for this route
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some((role) => hasRole(role));
    if (!hasAccess) {
      return (
        <div
          className="d-flex justify-content-center align-items-center bg-light text-dark"
          style={{ height: "100vh", width: "100vw" }}
        >
          <div
            className="text-center p-5 border rounded shadow-sm bg-white"
            style={{ maxWidth: "500px" }}
          >
            <h1 className="text-danger mb-4">403 - Không có quyền truy cập</h1>
            <p className="lead mb-4">
              Tài khoản của bạn có vai trò là{" "}
              <strong className="text-gold">Khách hàng</strong> nên không có
              quyền truy cập vào trang quản lý dành cho nhân viên.
            </p>
            <button
              className="btn btn-outline-secondary w-100 mb-2"
              onClick={() => navigate("/")}
            >
              Quay lại Trang chủ
            </button>
            <button className="btn btn-danger w-100" onClick={logout}>
              Đăng xuất & Đăng nhập tài khoản khác
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
