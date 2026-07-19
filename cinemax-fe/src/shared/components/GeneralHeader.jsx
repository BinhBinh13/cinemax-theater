import { Link } from 'react-router-dom';

export default function GeneralHeader() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 shadow-sm">
      <div className="container-xl">
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-3 text-dark text-decoration-none" to="/">
          <i className="fa fa-film text-danger me-2"></i>
          <span>CINEMAX</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-4">
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-secondary px-3" to="/movies">
                Movies
              </Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            <Link className="btn btn-outline-dark fw-semibold px-4 rounded-pill" to="/staff/movies">
              <i className="fa fa-user-circle me-2"></i>Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
