import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import AdminSideBar from "../components/AdminSideBar";
import adminService from "../services/adminService";
import "../styles/AdminDashboard.css";

export default function AdminMovieManagement() {
  const [movies, setMovies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form fields state
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("COMING_SOON");

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = () => {
    adminService.getMovies()
      .then((data) => setMovies(data))
      .catch((err) => alert("Lỗi khi tải phim: " + err.message));
  };

  const handleShowAdd = () => {
    setId("");
    setTitle("");
    setDurationMinutes("");
    setDescription("");
    setPosterUrl("");
    setReleaseDate("");
    setEndDate("");
    setStatus("COMING_SOON");
    setShowModal(true);
  };

  const handleShowEdit = (movie) => {
    setId(movie.id);
    setTitle(movie.title || "");
    setDurationMinutes(movie.durationMinutes || "");
    setDescription(movie.description || "");
    setPosterUrl(movie.posterUrl || "");
    setReleaseDate(movie.releaseDate || "");
    setEndDate(movie.endDate || "");
    setStatus(movie.status || "COMING_SOON");
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!title) {
      alert("Vui lòng nhập tên phim!");
      return;
    }

    const movieData = {
      title,
      durationMinutes: Number(durationMinutes),
      description,
      posterUrl,
      releaseDate,
      endDate,
      status
    };

    if (id) {
      // Update
      adminService.updateMovie(id, movieData)
        .then(() => {
          alert("Cập nhật phim thành công!");
          setShowModal(false);
          loadMovies();
        })
        .catch((err) => alert("Lỗi cập nhật: " + err.message));
    } else {
      // Create
      adminService.createMovie(movieData)
        .then(() => {
          alert("Thêm phim thành công!");
          setShowModal(false);
          loadMovies();
        })
        .catch((err) => alert("Lỗi thêm phim: " + err.message));
    }
  };

  const handleDelete = (movie) => {
    const check = window.confirm("Bạn có chắc chắn muốn ngưng chiếu phim: " + movie.title + "?");
    if (check) {
      adminService.deleteMovie(movie.id)
        .then(() => {
          alert("Đã chuyển phim sang trạng thái ngừng chiếu!");
          loadMovies();
        })
        .catch((err) => alert("Lỗi xóa phim: " + err.message));
    }
  };

  return (
    <div className="admin-dashboard-container">
      <AdminSideBar />
      <div className="admin-main">
        <h2 className="mb-4">Quản lý danh sách phim</h2>
        <button className="btn btn-danger mb-3" onClick={handleShowAdd}>
          + Thêm phim mới
        </button>

        <table className="table table-bordered table-striped bg-white">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Ảnh poster</th>
              <th>Tên phim</th>
              <th>Thời lượng</th>
              <th>Ngày chiếu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.id}>
                <td>{movie.id}</td>
                <td>
                  <img 
                    src={movie.posterUrl || "https://placehold.co/100"} 
                    alt="Poster" 
                    style={{ width: "50px", height: "70px", objectFit: "cover" }} 
                  />
                </td>
                <td><strong>{movie.title}</strong></td>
                <td>{movie.durationMinutes} phút</td>
                <td>{movie.releaseDate || "—"}</td>
                <td>{movie.endDate || "—"}</td>
                <td>
                  <span className={`badge ${movie.status === "NOW_SHOWING" || movie.status === "ACTIVE" ? "bg-success" : movie.status === "COMING_SOON" ? "bg-info" : "bg-secondary"}`}>
                    {movie.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleShowEdit(movie)}>
                    Sửa
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(movie)}>
                    Ngừng chiếu
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
            <h5 className="modal-title">{id ? "Chỉnh sửa phim" : "Thêm phim mới"}</h5>
            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Tên phim *</label>
              <input 
                type="text" 
                className="form-control" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Thời lượng (phút) *</label>
              <input 
                type="number" 
                className="form-control" 
                value={durationMinutes} 
                onChange={(e) => setDurationMinutes(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Đường dẫn ảnh poster</label>
              <input 
                type="text" 
                className="form-control" 
                value={posterUrl} 
                onChange={(e) => setPosterUrl(e.target.value)} 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ngày khởi chiếu</label>
              <input 
                type="date" 
                className="form-control" 
                value={releaseDate} 
                onChange={(e) => setReleaseDate(e.target.value)} 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ngày kết thúc</label>
              <input 
                type="date" 
                className="form-control" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Trạng thái</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="COMING_SOON">Sắp chiếu</option>
                <option value="NOW_SHOWING">Đang chiếu</option>
                <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                <option value="ENDED">Ngừng chiếu</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Mô tả phim</label>
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
              Lưu lại
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
