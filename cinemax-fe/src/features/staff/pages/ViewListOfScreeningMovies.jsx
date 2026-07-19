import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffSideBar from "../components/StaffSideBar";
import MovieFiltersBar from "../components/MovieFiltersBar";
import MovieGrid from "../components/MovieGrid";
import { getMovies, deleteMovie } from "../services/movieService";

export default function ViewListOfScreeningMovies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftSearchText, setDraftSearchText] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getMovies()
      .then((data) => {
        if (mounted) setMovies(data);
      })
      .catch((err) => {
        if (mounted) setError(`Failed to load movies: ${err.message}`);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchText.toLowerCase().trim()),
  );

  const handleSearch = () => {
    setSearchText(draftSearchText);
  };

  async function handleDeleteMovie(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(`Failed to delete movie: ${err.response?.data || err.message}`);
    }
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <StaffSideBar />
      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-normal mb-0">Movie list</h4>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/staff/movies/new')}>
            + Add Movie
          </button>
        </div>
        <MovieFiltersBar
          draftSearchText={draftSearchText}
          onDraftSearchTextChange={setDraftSearchText}
          onSearchClick={handleSearch}
        />
        {error && <div className="text-danger mb-3">{error}</div>}
        {loading ? (
          <div className="text-muted">Loading movies...</div>
        ) : (
          <MovieGrid movies={filteredMovies} onDelete={handleDeleteMovie} />
        )}
      </main>
    </div>
  );
}
