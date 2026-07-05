import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import AdminSideBar from "../components/AdminSideBar";
import adminService from "../services/adminService";
import "../styles/AdminDashboard.css";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // User form states
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // Search filter
  const [searchWord, setSearchWord] = useState("");

  useEffect(() => {
    loadUsersAndRoles();
  }, []);

  const loadUsersAndRoles = () => {
    Promise.all([adminService.getUsers(), adminService.getRoles()])
      .then(([userData, roleData]) => {
        setUsers(userData);
        setRoles(roleData);
      })
      .catch((err) => alert("Lỗi khi tải dữ liệu người dùng: " + err.message));
  };

  const handleShowAdd = () => {
    setId("");
    setUsername("");
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setStatus("ACTIVE");
    setSelectedRoleIds([]);
    setShowModal(true);
  };

  const handleShowEdit = (user) => {
    setId(user.id);
    setUsername(user.username || "");
    setEmail(user.email || "");
    setPassword(""); // Do not show password, type to change
    setFullName(user.fullName || "");
    setPhone(user.phone || "");
    setStatus(user.status || "ACTIVE");
    setSelectedRoleIds(user.roles ? user.roles.map((r) => r.id) : []);
    setShowModal(true);
  };

  const handleRoleToggle = (roleId) => {
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter((rid) => rid !== roleId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!username || !email) {
      alert("Vui lòng nhập tên tài khoản và email!");
      return;
    }
    if (!id && !password) {
      alert("Vui lòng nhập mật khẩu cho tài khoản mới!");
      return;
    }

    const userData = {
      username,
      email,
      fullName,
      phone,
      status,
      roleIds: selectedRoleIds
    };

    if (password) {
      userData.password = password;
    }

    if (id) {
      adminService.updateUser(id, userData)
        .then(() => {
          alert("Cập nhật tài khoản thành công!");
          setShowModal(false);
          loadUsersAndRoles();
        })
        .catch((err) => alert("Lỗi khi cập nhật: " + err.message));
    } else {
      adminService.createUser(userData)
        .then(() => {
          alert("Tạo tài khoản thành công!");
          setShowModal(false);
          loadUsersAndRoles();
        })
        .catch((err) => alert("Lỗi khi tạo mới: " + err.message));
    }
  };

  const handleDelete = (user) => {
    const check = window.confirm("Bạn có chắc chắn muốn khóa tài khoản này: " + user.username + "?");
    if (check) {
      adminService.deleteUser(user.id)
        .then(() => {
          alert("Đã chuyển đổi tài khoản sang trạng thái dừng hoạt động (INACTIVE)!");
          loadUsersAndRoles();
        })
        .catch((err) => alert("Lỗi khi khóa tài khoản: " + err.message));
    }
  };

  const filteredUsers = users.filter((u) => {
    const word = searchWord.toLowerCase();
    return (
      u.username.toLowerCase().includes(word) ||
      u.email.toLowerCase().includes(word) ||
      (u.fullName && u.fullName.toLowerCase().includes(word))
    );
  });

  return (
    <div className="admin-dashboard-container">
      <AdminSideBar />
      <div className="admin-main">
        <h2 className="mb-4">Quản lý nhân sự & phân quyền</h2>

        <div className="row mb-3 align-items-center">
          <div className="col-md-4">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Tìm theo tên, email, tài khoản..." 
              value={searchWord} 
              onChange={(e) => setSearchWord(e.target.value)} 
            />
          </div>
          <div className="col-md-8 text-end">
            <button className="btn btn-primary" onClick={handleShowAdd}>
              + Tạo tài khoản mới
            </button>
          </div>
        </div>

        <table className="table table-bordered table-striped bg-white">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Tên tài khoản</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td><strong>{user.username}</strong></td>
                <td>{user.fullName || "—"}</td>
                <td>{user.email}</td>
                <td>{user.phone || "—"}</td>
                <td>
                  {user.roles && user.roles.map((r) => (
                    <span key={r.id} className="badge bg-info text-dark me-1">
                      {r.name}
                    </span>
                  ))}
                </td>
                <td>
                  <span className={`badge ${user.status === "ACTIVE" ? "bg-success" : "bg-danger"}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleShowEdit(user)}>
                    Sửa
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user)}>
                    Khóa tài khoản
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <form onSubmit={handleSave}>
          <div className="modal-header">
            <h5 className="modal-title">{id ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}</h5>
            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Tên tài khoản *</label>
              <input 
                type="text" 
                className="form-control" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                disabled={!!id} 
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">{id ? "Mật khẩu mới (bỏ trống nếu không đổi)" : "Mật khẩu *"}</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required={!id} 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Họ và tên</label>
              <input 
                type="text" 
                className="form-control" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <input 
                type="text" 
                className="form-control" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Trạng thái</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="LOCKED">LOCKED</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label d-block">Phân quyền vai trò</label>
              <div className="d-flex flex-wrap gap-3">
                {roles.map((r) => (
                  <div key={r.id} className="form-check">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      id={`modal-role-${r.id}`}
                      checked={selectedRoleIds.includes(r.id)}
                      onChange={() => handleRoleToggle(r.id)}
                    />
                    <label className="form-check-label" htmlFor={`modal-role-${r.id}`}>
                      {r.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu tài khoản
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
