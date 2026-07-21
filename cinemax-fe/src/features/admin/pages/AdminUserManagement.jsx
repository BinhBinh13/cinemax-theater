import React, { useEffect, useState } from "react";
import { Modal, Tab, Nav, Badge, Button, Form, Table, Card, Row, Col } from "react-bootstrap";
import AdminSideBar from "../components/AdminSideBar";
import adminService from "../services/adminService";
import "../styles/AdminDashboard.css";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("STAFF");

  // Form states
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // Search and status filter
  const [searchWord, setSearchWord] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadUsersAndRoles();
  }, []);

  const loadUsersAndRoles = () => {
    Promise.all([adminService.getUsers(), adminService.getRoles()])
      .then(([userData, roleData]) => {
        setUsers(userData || []);
        setRoles(roleData || []);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu người dùng:", err);
      });
  };

  const handleShowAddStaff = () => {
    setId("");
    setUsername("");
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setStatus("ACTIVE");

    // Auto check STAFF role
    const staffRole = roles.find((r) => r.name === "ROLE_STAFF" || r.name === "STAFF");
    setSelectedRoleIds(staffRole ? [staffRole.id] : [2]);
    setShowModal(true);
  };

  const handleShowAddCustomer = () => {
    setId("");
    setUsername("");
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setStatus("ACTIVE");

    // Auto check CUSTOMER role
    const customerRole = roles.find((r) => r.name === "ROLE_CUSTOMER" || r.name === "CUSTOMER");
    setSelectedRoleIds(customerRole ? [customerRole.id] : [1]);
    setShowModal(true);
  };

  const handleShowEdit = (user) => {
    setId(user.id);
    setUsername(user.username || "");
    setEmail(user.email || "");
    setPassword("");
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
      roleIds: selectedRoleIds,
    };

    if (password) {
      userData.password = password;
    }

    if (id) {
      adminService
        .updateUser(id, userData)
        .then(() => {
          alert("Cập nhật thông tin tài khoản thành công!");
          setShowModal(false);
          loadUsersAndRoles();
        })
        .catch((err) => alert("Lỗi khi cập nhật: " + err.message));
    } else {
      adminService
        .createUser(userData)
        .then(() => {
          alert("Tạo mới tài khoản thành công!");
          setShowModal(false);
          loadUsersAndRoles();
        })
        .catch((err) => alert("Lỗi khi tạo mới: " + err.message));
    }
  };

  const handleToggleLockStatus = (user) => {
    const nextStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    const actionText = nextStatus === "LOCKED" ? "Khóa tài khoản" : "Mở khóa tài khoản";
    const check = window.confirm(`Bạn có chắc chắn muốn ${actionText} của: ${user.username}?`);
    if (check) {
      adminService
        .updateUser(user.id, { ...user, status: nextStatus, roleIds: user.roles?.map((r) => r.id) || [] })
        .then(() => {
          alert(`Đã ${actionText} thành công!`);
          loadUsersAndRoles();
        })
        .catch((err) => alert("Lỗi khi thay đổi trạng thái: " + err.message));
    }
  };

  // Filter staff vs customer
  const staffList = users.filter((u) => u.roles?.some((r) => r.name?.includes("STAFF")));
  const customerList = users.filter((u) => !u.roles?.some((r) => r.name?.includes("STAFF")));

  const currentDisplayList = activeTab === "STAFF" ? staffList : customerList;

  const filteredUsers = currentDisplayList.filter((u) => {
    const word = searchWord.toLowerCase();
    const matchesSearch =
      (u.username && u.username.toLowerCase().includes(word)) ||
      (u.email && u.email.toLowerCase().includes(word)) ||
      (u.fullName && u.fullName.toLowerCase().includes(word));

    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="d-flex min-vh-100 bg-light">
      <AdminSideBar />

      <div className="flex-grow-1 p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3.5 rounded border shadow-sm">
          <div>
            <h3 className="fw-black text-dark mb-1 d-flex align-items-center gap-2">
              🛡️ CỔNG QUẢN TRỊ VIỆN - QUẢN LÝ TÀI KHOẢN
            </h3>
            <p className="text-secondary small mb-0">
              Phân hệ Admin dành riêng cho việc Quản lý Nhân sự Rạp (Staff CRUD) & Tài khoản Khách hàng (Customers).
            </p>
          </div>

          <div>
            {activeTab === "STAFF" ? (
              <Button variant="danger" className="fw-bold shadow-sm px-3 py-2" onClick={handleShowAddStaff}>
                ➕ Thêm Nhân Viên Mới (Staff)
              </Button>
            ) : (
              <Button variant="outline-danger" className="fw-bold shadow-sm px-3 py-2" onClick={handleShowAddCustomer}>
                ➕ Thêm Khách Hàng Mới (User)
              </Button>
            )}
          </div>
        </div>

        {/* Overview Stats Cards */}
        <Row className="g-3 mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm bg-primary bg-opacity-10 text-primary p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase small fw-bold">Tổng Số Nhân Viên (Staff)</div>
                  <div className="fs-2 fw-black">{staffList.length} người</div>
                </div>
                <div className="fs-1">👨‍💼</div>
              </div>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm bg-success bg-opacity-10 text-success p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase small fw-bold">Tổng Số Khách Hàng (Customers)</div>
                  <div className="fs-2 fw-black">{customerList.length} tài khoản</div>
                </div>
                <div className="fs-1">👤</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tab Selection */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="pills" className="bg-white p-1.5 rounded border mb-4 gap-2 shadow-xs">
            <Nav.Item>
              <Nav.Link eventKey="STAFF" className="fw-bold px-4 py-2 text-uppercase">
                👨‍💼 QUẢN LÝ NHÂN VIÊN (STAFF) ({staffList.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="CUSTOMER" className="fw-bold px-4 py-2 text-uppercase">
                👤 QUẢN LÝ KHÁCH HÀNG (CUSTOMERS) ({customerList.length})
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {/* Filters & Search */}
          <div className="bg-white p-3 rounded border mb-4 shadow-sm">
            <Row className="g-3 align-items-center">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="🔍 Tìm kiếm tên tài khoản, email, họ tên..."
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">-- Tất cả trạng thái --</option>
                  <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Dừng hoạt động)</option>
                  <option value="LOCKED">LOCKED (Đã khóa)</option>
                </Form.Select>
              </Col>
              <Col md={3} className="text-end text-secondary small fw-semibold">
                Đang hiển thị {filteredUsers.length} tài khoản.
              </Col>
            </Row>
          </div>

          {/* Main User/Staff Table */}
          <div className="bg-white rounded border shadow-sm overflow-hidden mb-4">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Tài Khoản</th>
                  <th>Họ và Tên</th>
                  <th>Email</th>
                  <th>Số Điện Thoại</th>
                  <th>Vai Trò (Role)</th>
                  <th>Trạng Thái</th>
                  <th className="text-center">Thao Tác Quản Lý (CRUD)</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>
                        <strong className="text-danger">{user.username}</strong>
                      </td>
                      <td>{user.fullName || "—"}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "—"}</td>
                      <td>
                        {user.roles?.map((r) => (
                          <Badge key={r.id} bg={r.name?.includes("STAFF") ? "warning" : "info"} className="text-dark me-1">
                            {r.name}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        <Badge bg={user.status === "ACTIVE" ? "success" : user.status === "LOCKED" ? "danger" : "secondary"}>
                          {user.status || "ACTIVE"}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button variant="warning" size="sm" className="fw-bold me-2" onClick={() => handleShowEdit(user)}>
                          ✏️ Sửa
                        </Button>
                        <Button
                          variant={user.status === "ACTIVE" ? "outline-danger" : "outline-success"}
                          size="sm"
                          className="fw-bold"
                          onClick={() => handleToggleLockStatus(user)}
                        >
                          {user.status === "ACTIVE" ? "🔒 Khóa tài khoản" : "🔓 Mở khóa"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Tab.Container>
      </div>

      {/* Modal for CRUD Staff / Customer */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title className="fw-bold fs-5">
              {id ? "✏️ CẬP NHẬT THÔNG TIN TÀI KHOẢN" : "➕ TẠO MỚI TÀI KHOẢN STAFF / CUSTOMER"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark">Tên tài khoản (Username) *</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!!id}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark">Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark">
                    {id ? "Mật khẩu mới (Bỏ trống nếu giữ nguyên)" : "Mật khẩu *"}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!id}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark">Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark">Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark">Trạng thái hoạt động</Form.Label>
                  <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
                    <option value="INACTIVE">INACTIVE (Dừng hoạt động)</option>
                    <option value="LOCKED">LOCKED (Tạm khóa)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark d-block">Phân quyền vai trò (Role)</Form.Label>
                  <div className="d-flex flex-wrap gap-3 bg-light p-3 rounded border">
                    {roles.map((r) => (
                      <Form.Check
                        key={r.id}
                        type="checkbox"
                        id={`role-chk-${r.id}`}
                        label={r.name}
                        checked={selectedRoleIds.includes(r.id)}
                        onChange={() => handleRoleToggle(r.id)}
                        className="fw-semibold small"
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" type="submit" className="fw-bold px-4">
              💾 LƯU THÔNG TIN
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
