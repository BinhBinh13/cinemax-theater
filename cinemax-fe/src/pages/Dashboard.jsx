import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; 

function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  const moviesData = [
    { id: 1, title: "Avengers: Endgame", genre: "Hành động / Khoa học viễn tưởng", duration: "181 phút", status: "now_showing" },
    { id: 2, title: "Doraemon: Bản Tình Ca Đất Nước", genre: "Hoạt hình / Gia đình", duration: "115 phút", status: "now_showing" },
    { id: 3, title: "Lật Mặt 8", genre: "Hài / Hành động / Tâm lý", duration: "120 phút", status: "now_showing" },
    { id: 4, title: "Avatar 3: Gió và Lửa", genre: "Phiêu lưu / Giả tưởng", duration: "160 phút", status: "coming_soon" },
    { id: 5, title: "Spider-Man: Beyond the Spider-Verse", genre: "Hoạt hình / Anh hùng", duration: "140 phút", status: "coming_soon" },
  ];

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (!token) {
      navigate('/');
    } else {
      setUsername(savedUser || 'Khách hàng');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleBookTicket = (movieTitle) => {
    alert(`Tính năng đặt vé cho phim "${movieTitle}" đang được phát triển ở các bước tiếp theo!`);
  };

  const nowShowing = moviesData.filter(movie => movie.status === "now_showing");
  const comingSoon = moviesData.filter(movie => movie.status === "coming_soon");

  return (
    <div className="cinema-dashboard">
      {}
      <header className="cinema-header">
        <h1>🍿 CINEMA STAR</h1>
        <div className="user-info">
          <span>Xin chào, <strong>{username}</strong> (Customer)</span>
          <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
        </div>
      </header>

      {}
      <section className="movie-section">
        <h2>Phim Đang Chiếu</h2>
        <div className="movie-grid">
          {nowShowing.map(movie => (
            <div key={movie.id} className="movie-card">
              {}
              <div className="movie-poster">🎬 POSTER PHIM</div>
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <div className="movie-meta">
                  <p>{movie.genre}</p>
                  <p>Thời lượng: {movie.duration}</p>
                </div>
                <button onClick={() => handleBookTicket(movie.title)} className="btn-book">
                  Đặt Vé Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {}
      <section className="movie-section">
        <h2>Phim Sắp Chiếu</h2>
        <div className="movie-grid">
          {comingSoon.map(movie => (
            <div key={movie.id} className="movie-card" style={{ opacity: 0.8 }}>
              <div className="movie-poster" style={{ backgroundColor: '#252525' }}>⏳ COMING SOON</div>
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <div className="movie-meta">
                  <p>{movie.genre}</p>
                  <p>Thời lượng: {movie.duration}</p>
                </div>
                <button className="btn-book" style={{ backgroundColor: '#555', cursor: 'not-allowed' }} disabled>
                  Chưa Mở Bán
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;