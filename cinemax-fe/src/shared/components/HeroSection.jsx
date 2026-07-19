export default function HeroSection({
  searchTerm,
  setSearchTerm,
  language,
  setLanguage,
  category,
  setCategory,
  status,
  setStatus,
  sortBy,
  setSortBy,
  languages = [],
  categories = [],
  onReset,
}) {
  return (
    <div className="bg-light py-5 border-bottom">
      <div className="container-xl text-center">
        <h1 className="fw-bold mb-2 text-dark">Discover Screening Movies</h1>
        <p className="text-muted fs-5 mb-4">Book ticket in seconds and enjoy premium cinema quality</p>

        <div className="card shadow-sm border-0 p-4 max-width-auto mx-auto" style={{ maxWidth: '900px' }}>
          <div className="row g-3">
            {/* Search Bar */}
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fa fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search movie title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Language Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="">Language</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Genre</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Status</option>
                <option value="NOW_SHOWING">Screening</option>
                <option value="COMING_SOON">Upcoming</option>
                <option value="ENDED">Ended</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className="text-end mt-3">
            <button className="btn btn-outline-danger btn-sm px-4 fw-semibold rounded-pill" onClick={onReset}>
              <i className="fa fa-refresh me-1"></i> Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
