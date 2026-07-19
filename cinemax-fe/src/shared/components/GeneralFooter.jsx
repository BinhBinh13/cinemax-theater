export default function GeneralFooter() {
  return (
    <footer className="bg-dark text-white py-5 mt-auto border-top">
      <div className="container-xl">
        <div className="row g-4">
          <div className="col-md-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <i className="fa fa-film text-danger me-2"></i>
              <span>CINEMAX</span>
            </h5>
            <p className="text-secondary small">
              Providing premium cinematic experiences with the best picture quality, immersive surround sound, and comfortable seating layouts.
            </p>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Hotline & Help</h5>
            <p className="text-secondary small mb-1">
              <i className="fa fa-phone text-danger me-2"></i>Hotline: 1900-1234
            </p>
            <p className="text-secondary small mb-1">
              <i className="fa fa-envelope text-danger me-2"></i>Email: support@cinemax.com
            </p>
            <p className="text-secondary small">
              <i className="fa fa-map-marker text-danger me-2"></i>123 Main Street, City Center
            </p>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Cinema Partners</h5>
            <div className="d-flex flex-wrap gap-2 fs-6">
              <span className="badge bg-secondary">VNPAY Payment</span>
              <span className="badge bg-secondary">Cloudinary Media</span>
              <span className="badge bg-secondary">Bootstrap UI</span>
            </div>
          </div>
        </div>
        <hr className="my-4 border-secondary" />
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <span className="text-secondary small">&copy; {new Date().getFullYear()} Cinemax Theater. All rights reserved.</span>
          </div>
          <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
            <a href="#" className="text-secondary text-decoration-none small me-3">Terms of Use</a>
            <a href="#" className="text-secondary text-decoration-none small">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
