import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const translations = {
  vi: {
    brandName: 'CINEMAX',
    promoNotice: 'VÉ XEM PHIM CINEMAX - MUA 1 TẶNG 1 TRÊN APP NGÂN HÀNG',
    movies: 'PHIM',
    theaters: 'RẠP CINEMAX',
    membership: 'THÀNH VIÊN',
    buyTicketNow: 'MUA VÉ NGAY',
    myTickets: 'Vé của tôi',
    loginRegister: '👤 Đăng ký / Đăng nhập',
    logout: 'Đăng xuất',
    hi: 'Xin chào',
    nowShowing: 'PHIM ĐANG CHIẾU',
    comingSoon: 'PHIM SẮP CHIẾU',
    allMovies: 'TẤT CẢ PHIM',
    searchPlaceholder: 'Tìm tên phim...',
    loadingMovies: 'Đang tải danh sách 20 phim Cinemax...',
    noMoviesFound: 'Không tìm thấy bộ phim nào phù hợp.',
    buyTicket: 'MUA VÉ',
    viewDetails: 'XEM CHI TIẾT',
    duration: 'Thời lượng',
    minutes: 'phút',
    movieSelection: 'DANH SÁCH PHIM',
    backToHome: 'Quay lại Trang Chủ',
    backToMovieDetails: 'Quay lại Chi Tiết Phim',
    
    // Auth
    loginTitle: 'TÀI KHOẢN CINEMAX',
    loginDesc: 'Đăng nhập để nhận ưu đãi thành viên và đặt vé nhanh chóng',
    usernameOrEmail: 'Tên đăng nhập hoặc Email *',
    password: 'Mật khẩu *',
    confirmPassword: 'Nhập lại mật khẩu *',
    fullName: 'Họ và tên',
    phone: 'Số điện thoại',
    loginBtn: 'ĐĂNG NHẬP',
    registerBtn: 'TẠO TÀI KHOẢN',
    createAccountTitle: 'TẠO TÀI KHOẢN CINEMAX',
    createAccountDesc: 'Trở thành thành viên Cinemax để nhận các đặc quyền ưu đãi hấp dẫn',
    noAccountYet: 'Chưa có tài khoản?',
    registerNow: 'Tạo tài khoản Cinemax ngay',
    alreadyHaveAccount: 'Đã có tài khoản?',
    loginNow: 'Đăng nhập ngay',

    // Footer
    companyName: 'CÔNG TY TNHH CINEMAX VIỆT NAM',
    hotline: 'Hotline',
    workHours: 'Giờ làm việc: 8:00 - 22:00 (Tất cả các ngày)',
    supportEmail: 'Email hỗ trợ: hoidap@cinemax.vn',
    rights: 'COPYRIGHT 2026 CINEMAX VIETNAM CO., LTD. ALL RIGHTS RESERVED',
    aboutUs: 'Giới thiệu Cinemax',
    terms: 'Điều khoản sử dụng',
    contact: 'Chăm sóc khách hàng'
  },
  en: {
    brandName: 'CINEMAX',
    promoNotice: 'CINEMAX TICKETS - BUY 1 GET 1 FREE ON BANKING APPS',
    movies: 'MOVIES',
    theaters: 'CINEMAX THEATERS',
    membership: 'MEMBERSHIP',
    buyTicketNow: 'BUY TICKETS',
    myTickets: 'My Tickets',
    loginRegister: '👤 Register / Login',
    logout: 'Log out',
    hi: 'Hello',
    nowShowing: 'NOW SHOWING',
    comingSoon: 'COMING SOON',
    allMovies: 'ALL MOVIES',
    searchPlaceholder: 'Search movie title...',
    loadingMovies: 'Loading 20 Cinemax movies...',
    noMoviesFound: 'No movies found matching your search.',
    buyTicket: 'BUY TICKET',
    viewDetails: 'VIEW DETAILS',
    duration: 'Duration',
    minutes: 'mins',
    movieSelection: 'MOVIE SELECTION',
    backToHome: 'Back to Home',
    backToMovieDetails: 'Back to Movie Details',
    
    // Auth
    loginTitle: 'CINEMAX ACCOUNT',
    loginDesc: 'Log in to enjoy member benefits and book tickets quickly',
    usernameOrEmail: 'Username or Email *',
    password: 'Password *',
    confirmPassword: 'Confirm Password *',
    fullName: 'Full Name',
    phone: 'Phone Number',
    loginBtn: 'LOG IN',
    registerBtn: 'CREATE ACCOUNT',
    createAccountTitle: 'CREATE CINEMAX ACCOUNT',
    createAccountDesc: 'Become a Cinemax member for exclusive rewards',
    noAccountYet: "Don't have an account?",
    registerNow: 'Create a Cinemax account now',
    alreadyHaveAccount: 'Already have an account?',
    loginNow: 'Log in now',

    // Footer
    companyName: 'CINEMAX VIETNAM CO., LTD.',
    hotline: 'Hotline',
    workHours: 'Operating hours: 8:00 AM - 10:00 PM (Daily)',
    supportEmail: 'Support Email: support@cinemax.vn',
    rights: 'COPYRIGHT 2026 CINEMAX VIETNAM CO., LTD. ALL RIGHTS RESERVED',
    aboutUs: 'About Cinemax',
    terms: 'Terms of Use',
    contact: 'Customer Support'
  }
}

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('cinemax_lang') || 'vi'
  })

  useEffect(() => {
    localStorage.setItem('cinemax_lang', lang)
  }, [lang])

  const t = (key) => {
    return translations[lang]?.[key] || translations['vi']?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
