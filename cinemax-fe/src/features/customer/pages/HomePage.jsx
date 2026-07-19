import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import { getMovies } from '@/features/customer/services/MovieService';
import '../styles/HomePage.css';

// Helper to convert standard YouTube watch URLs to embeddable URLs
function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  try {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlParts = url.split('?');
      if (urlParts.length > 1) {
        const urlParams = new URLSearchParams(urlParts[1]);
        videoId = urlParams.get('v');
      }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch (e) {
    return url;
  }
}

export default function HomePage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal trailer states
  const [activeTrailerUrl, setActiveTrailerUrl] = useState('');
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // Refs for scrolling sliders
  const nowShowingRef = useRef(null);
  const comingSoonRef = useRef(null);

  // Fetch movies on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    getMovies()
      .then((data) => {
        if (!mounted) return;
        setMovies(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Failed to fetch movies from server.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleScroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const openTrailer = (trailerUrl) => {
    if (trailerUrl) {
      setActiveTrailerUrl(getYoutubeEmbedUrl(trailerUrl));
      setShowTrailerModal(true);
    }
  };

  const closeTrailer = () => {
    setActiveTrailerUrl('');
    setShowTrailerModal(false);
  };

  // Filter movies by status
  const nowShowingMovies = movies.filter((m) => m.status === 'NOW_SHOWING');
  const comingSoonMovies = movies.filter((m) => m.status === 'COMING_SOON');

  // Select banner movies: prioritize movies with bannerUrl, then poster
  const bannerMovies = movies
    .filter((m) => m.bannerUrl || m.poster)
    .slice(0, 5);

  return (
    <div className="home-container">

      {/* --- BANNER CAROUSEL --- */}
      <section id="center_h" className="center_home overflow-hidden">
        {loading ? (
          <div className="carousel-item-custom d-flex align-items-center justify-content-center">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="carousel-item-custom d-flex align-items-center justify-content-center text-center p-4">
            <div className="text-white">
              <i className="fa fa-exclamation-triangle fs-1 text-warning mb-3"></i>
              <h5>Failed to load banner movies</h5>
              <p className="text-white-50">{error}</p>
            </div>
          </div>
        ) : bannerMovies.length === 0 ? (
          <div className="carousel-item-custom d-flex align-items-center justify-content-center text-center p-4">
            <div className="text-white">
              <i className="fa fa-film fs-1 text-muted mb-3"></i>
              <h5>No movies available</h5>
            </div>
          </div>
        ) : (
          <Carousel 
            id="carouselExampleCaptions" 
            controls={true} 
            indicators={true} 
            interval={5000} 
            fade={true}
          >
            {bannerMovies.map((movie) => {
              const categories = movie.categories || [];
              const genreText = categories.map((c) => c.categoryName || c).join(', ') || 'Genre';
              
              return (
                <Carousel.Item key={movie.id} className="carousel-item-custom">
                  <img
                    src={movie.bannerUrl || movie.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop"}
                    className="carousel-banner-img"
                    alt={movie.title}
                  />
                  <div className="carousel-overlay"></div>
                  <div className="carousel-caption-container">
                    <div className="container-xl">
                      <div className="carousel-caption-content">
                        <div className="movie-tagline">{movie.status === 'COMING_SOON' ? 'Coming Soon' : 'Now Showing'}</div>
                        <h1 className="movie-title">{movie.title}</h1>
                        
                        <div className="carousel-meta-tags">
                          {movie.rating && (
                            <span className="meta-badge rating-badge">
                              <i className="fa fa-star me-1"></i> {movie.rating}
                            </span>
                          )}
                          <span className="meta-badge">{genreText}</span>
                          {movie.duration && (
                            <span className="meta-text">
                              <i className="fa-regular fa-clock"></i> {movie.duration} Mins
                            </span>
                          )}
                          {movie.language && (
                            <span className="meta-text ms-2">
                              <i className="fa-solid fa-earth-americas"></i> {movie.language}
                            </span>
                          )}
                        </div>

                        <p className="movie-plot">
                          {movie.description || 'Enjoy this amazing cinematic experience exclusively at Cinemax Theater. Book your tickets now for the best seats!'}
                        </p>

                        <div className="carousel-actions">
                          <Link to={`/movies/${movie.id}`} className="btn-buy-ticket">
                            <i className="fa fa-ticket"></i> Buy Ticket
                          </Link>
                          {movie.trailerUrl && (
                            <button onClick={() => openTrailer(movie.trailerUrl)} className="btn-watch-trailer">
                              <i className="fa fa-circle-play"></i> Watch Trailer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Carousel.Item>
              );
            })}
          </Carousel>
        )}
      </section>

      {/* --- NOW SHOWING SECTION --- */}
      <section id="now-showing" className="py-5 bg-white">
        <div className="container-xl">
          <div className="row mb-4 text-center">
            <div className="col-12">
              <h6 className="col_oran fw-bold text-uppercase mb-2">Now Showing in Theaters</h6>
              <h2 className="fw-bold home-section-title">NOW SHOWING</h2>
              <hr className="title-hr" />
            </div>
          </div>

          <div className="movie-slider-wrapper">
            {/* Scroll Buttons */}
            <button className="slider-nav-btn left" onClick={() => handleScroll(nowShowingRef, 'left')}>
              <i className="fa fa-chevron-left"></i>
            </button>
            <button className="slider-nav-btn right" onClick={() => handleScroll(nowShowingRef, 'right')}>
              <i className="fa fa-chevron-right"></i>
            </button>

            {/* Movie Slider */}
            <div className="movie-slider" ref={nowShowingRef}>
              {loading ? (
                <div className="w-100 text-center py-5">
                  <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : nowShowingMovies.length === 0 ? (
                <div className="slider-empty-state">
                  <i className="fa fa-film fs-2 d-block"></i>
                  <span>No movies are currently showing.</span>
                </div>
              ) : (
                nowShowingMovies.map((movie) => {
                  const categories = movie.categories || [];
                  const genreText = categories.map((c) => c.categoryName || c).join(', ') || 'Action, Drama';
                  
                  return (
                    <div key={movie.id} className="home-movie-card">
                      <div className="card-poster-wrapper">
                        <img 
                          src={movie.poster || "https://picsum.photos/id/237/400/600"} 
                          className="card-poster-img" 
                          alt={movie.title} 
                        />
                        {/* Hover Overlay with Glassmorphic Buttons */}
                        <div className="card-hover-overlay">
                          <Link to={`/movies/${movie.id}`} className="btn-action btn-action-primary">
                            <i className="fa fa-ticket me-1"></i> Book Ticket
                          </Link>
                          <Link to={`/movies/${movie.id}`} className="btn-action btn-action-secondary">
                            <i className="fa fa-circle-info me-1"></i> Get Detail
                          </Link>
                        </div>
                      </div>
                      <div className="card-info-bottom">
                        <h5 className="card-movie-title" title={movie.title}>{movie.title}</h5>
                        <p className="card-movie-genre" title={genreText}>{genreText}</p>
                        <div className="card-movie-meta">
                          {movie.duration && (
                            <span className="card-movie-duration">
                              <i className="fa-regular fa-clock"></i> {movie.duration} Mins
                            </span>
                          )}
                          {movie.language && (
                            <span className="card-movie-lang">{movie.language}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- COMING SOON SECTION --- */}
      <section id="coming-soon" className="py-5" style={{ backgroundColor: '#fcfbfe' }}>
        <div className="container-xl">
          <div className="row mb-4 text-center">
            <div className="col-12">
              <h6 className="col_oran fw-bold text-uppercase mb-2">Don't Miss Out</h6>
              <h2 className="fw-bold home-section-title">COMING SOON</h2>
              <hr className="title-hr" />
            </div>
          </div>

          <div className="movie-slider-wrapper">
            {/* Scroll Buttons */}
            <button className="slider-nav-btn left" onClick={() => handleScroll(comingSoonRef, 'left')}>
              <i className="fa fa-chevron-left"></i>
            </button>
            <button className="slider-nav-btn right" onClick={() => handleScroll(comingSoonRef, 'right')}>
              <i className="fa fa-chevron-right"></i>
            </button>

            {/* Movie Slider */}
            <div className="movie-slider" ref={comingSoonRef}>
              {loading ? (
                <div className="w-100 text-center py-5">
                  <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : comingSoonMovies.length === 0 ? (
                <div className="slider-empty-state">
                  <i className="fa fa-film fs-2 d-block"></i>
                  <span>No upcoming movies at the moment.</span>
                </div>
              ) : (
                comingSoonMovies.map((movie) => {
                  const categories = movie.categories || [];
                  const genreText = categories.map((c) => c.categoryName || c).join(', ') || 'Action, Drama';
                  
                  return (
                    <div key={movie.id} className="home-movie-card">
                      <div className="card-poster-wrapper">
                        <img 
                          src={movie.poster || "https://picsum.photos/id/237/400/600"} 
                          className="card-poster-img" 
                          alt={movie.title} 
                        />
                        <span className="upcoming-badge">Coming Soon</span>
                        {/* Hover Overlay with Glassmorphic Buttons */}
                        <div className="card-hover-overlay">
                          {movie.trailerUrl && (
                            <button 
                              onClick={() => openTrailer(movie.trailerUrl)} 
                              className="btn-action btn-action-primary"
                            >
                              <i className="fa fa-play me-1"></i> Watch Trailer
                            </button>
                          )}
                          <Link to={`/movies/${movie.id}`} className="btn-action btn-action-secondary">
                            <i className="fa fa-circle-info me-1"></i> More Info
                          </Link>
                        </div>
                      </div>
                      <div className="card-info-bottom">
                        <h5 className="card-movie-title" title={movie.title}>{movie.title}</h5>
                        <p className="card-movie-genre" title={genreText}>{genreText}</p>
                        <div className="card-movie-meta">
                          {movie.duration && (
                            <span className="card-movie-duration">
                              <i className="fa-regular fa-clock"></i> {movie.duration} Mins
                            </span>
                          )}
                          {movie.language && (
                            <span className="card-movie-lang">{movie.language}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- CINEMATIC TRAILER MODAL --- */}
      {showTrailerModal && (
        <div className="trailer-modal-backdrop" onClick={closeTrailer}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close-btn" onClick={closeTrailer}>
              <i className="fa-solid fa-xmark"></i>
              <span>Close</span>
            </button>
            <iframe
              className="iframe-video"
              src={`${activeTrailerUrl}?autoplay=1`}
              title="Movie Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
