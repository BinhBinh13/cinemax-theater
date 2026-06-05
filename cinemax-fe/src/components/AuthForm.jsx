import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

function AuthForm() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    if (isLogin) {

      const userFound = savedUsers.find(
        (u) => u.username === formData.username && u.password === formData.password
      );

      if (userFound) {
        localStorage.setItem('userToken', 'mock-jwt-token-for-' + formData.username);
        localStorage.setItem('currentUser', formData.username); 
        alert("Đăng nhập thành công! Chào mừng bạn đến với Cinema Star.");
        navigate('/dashboard');
      } else {
        alert("Tài khoản hoặc mật khẩu không chính xác!");
      }
    } else {

      if (formData.password !== formData.confirmPassword) {
        alert("Mật khẩu xác nhận không trùng khớp!");
        return;
      }

      const isUserExist = savedUsers.some((u) => u.username === formData.username);
      if (isUserExist) {
        alert("Tên tài khoản này đã tồn tại trên hệ thống rạp phim!");
        return;
      }

      const newUser = {
        username: formData.username,
        password: formData.password
      };
      savedUsers.push(newUser);

      localStorage.setItem('registeredUsers', JSON.stringify(savedUsers));
      
      alert("Đăng ký thành công tài khoản Cinema! Hệ thống sẽ chuyển về trang đăng nhập.");
      setIsLogin(true); 
      setFormData({ username: '', password: '', confirmPassword: '' });
    }
  };

  return (
    <div className="auth-card">
      {}
      <h2>🍿 {isLogin ? 'Cinema Star - Đăng Nhập' : 'Tạo Tài Khoản Thành Viên'}</h2>
      <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px', marginBottom: '20px' }}>
        {isLogin ? 'Đăng nhập để đặt vé xem phim ngay' : 'Đăng ký nhanh chóng, nhận ngàn ưu đãi'}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên tài khoản</label>
          <input 
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleInputChange} 
            placeholder="Nhập tên tài khoản hoặc nickname" 
            required 
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleInputChange} 
            placeholder="Nhập mật khẩu của bạn" 
            required 
          />
        </div>

        {!isLogin && (
          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleInputChange} 
              placeholder="Nhập lại mật khẩu để kiểm tra" 
              required 
            />
          </div>
        )}

        <button type="submit" className="btn-action">
          {isLogin ? 'Đăng Nhập' : 'Tham Gia Ngay'}
        </button>
      </form>

      <p className="switch-text">
        {isLogin ? 'Bạn chưa có tài khoản thành viên?' : 'Đã có tài khoản rạp phim?'} 
        {}
        <span onClick={handleToggleMode}>
          {isLogin ? 'Đăng ký thành viên' : 'Quay lại đăng nhập'}
        </span>
      </p>
    </div>
  );
}

export default AuthForm;