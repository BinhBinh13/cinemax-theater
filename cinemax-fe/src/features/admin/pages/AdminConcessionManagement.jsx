import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import AdminSideBar from "../components/AdminSideBar";
import adminService from "../services/adminService";
import "../styles/AdminDashboard.css";

export default function AdminConcessionManagement() {
  const [concessions, setConcessions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [id, setId] = useState("");
  const [itemName, setItemName] = useState("");
  const [type, setType] = useState("FOOD");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    loadConcessions();
  }, []);

  const loadConcessions = () => {
    adminService.getConcessions()
      .then((data) => setConcessions(data))
      .catch((err) => alert("Lỗi khi tải danh sách đồ ăn thức uống: " + err.message));
  };

  const handleShowAdd = () => {
    setId("");
    setItemName("");
    setType("FOOD");
    setPrice("");
    setDescription("");
    setImageUrl("");
    setStatus("ACTIVE");
    setShowModal(true);
  };

  const handleShowEdit = (item) => {
    setId(item.id);
    setItemName(item.itemName || "");
    setType(item.type || "FOOD");
    setPrice(item.price || "");
    setDescription(item.description || "");
    setImageUrl(item.imageUrl || "");
    setStatus(item.status || "ACTIVE");
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!itemName) {
      alert("Vui lòng điền tên sản phẩm!");
      return;
    }
    if (!price || Number(price) < 0) {
      alert("Giá bán không hợp lệ!");
      return;
    }

    const payload = {
      itemName,
      type,
      price: Number(price),
      description,
      imageUrl,
      status
    };

    if (id) {
      adminService.updateConcession(id, payload)
        .then(() => {
          alert("Cập nhật thành công!");
          setShowModal(false);
          loadConcessions();
        })
        .catch((err) => alert("Lỗi khi cập nhật: " + err.message));
    } else {
      adminService.createConcession(payload)
        .then(() => {
          alert("Thêm sản phẩm thành công!");
          setShowModal(false);
          loadConcessions();
        })
        .catch((err) => alert("Lỗi khi thêm: " + err.message));
    }
  };

  const handleDelete = (item) => {
    const check = window.confirm("Bạn có chắc chắn muốn ngưng bán sản phẩm: " + item.itemName + "?");
    if (check) {
      adminService.deleteConcession(item.id)
        .then(() => {
          alert("Đã chuyển đổi trạng thái sản phẩm sang ngưng bán!");
          loadConcessions();
        })
        .catch((err) => alert("Lỗi khi thực hiện: " + err.message));
    }
  };

  return (
    <div className="admin-dashboard-container">
      <AdminSideBar />
      <div className="admin-main">
        <h2 className="mb-4">Quản lý Đồ ăn & Nước uống</h2>
        <button className="btn btn-danger mb-3" onClick={handleShowAdd}>
          + Thêm đồ ăn / uống mới
        </button>

        <table className="table table-bordered table-striped bg-white">
          <thead className="table-dark">
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Loại</th>
              <th>Giá tiền (đ)</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {concessions.map((item) => (
              <tr key={item.id}>
                <td>
                  <img 
                    src={item.imageUrl || "https://placehold.co/100"} 
                    alt={item.itemName} 
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                  />
                </td>
                <td><strong>{item.itemName}</strong></td>
                <td>
                  <span className="badge bg-secondary">{item.type}</span>
                </td>
                <td className="text-danger fw-semibold">
                  {item.price ? item.price.toLocaleString("vi-VN") : "0"}đ
                </td>
                <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.description || "—"}
                </td>
                <td>
                  <span className={`badge ${item.status === "ACTIVE" ? "bg-success" : "bg-danger"}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleShowEdit(item)}>
                    Sửa
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item)}>
                    Ngừng bán
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
            <h5 className="modal-title">{id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h5>
            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Tên đồ uống / đồ ăn / combo *</label>
              <input 
                type="text" 
                className="form-control" 
                value={itemName} 
                onChange={(e) => setItemName(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phân loại</label>
              <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="FOOD">FOOD (Đồ ăn)</option>
                <option value="BEVERAGE">BEVERAGE (Đồ uống)</option>
                <option value="COMBO">COMBO (Gói kết hợp)</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Giá tiền (VNĐ) *</label>
              <input 
                type="number" 
                className="form-control" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">URL ảnh minh họa</label>
              <input 
                type="text" 
                className="form-control" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Trạng thái bán</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">ACTIVE (Đang bán)</option>
                <option value="INACTIVE">INACTIVE (Ngừng bán)</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Mô tả sản phẩm</label>
              <textarea 
                className="form-control" 
                rows="3" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Đóng
            </button>
            <button type="submit" className="btn btn-danger">
              Lưu sản phẩm
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
