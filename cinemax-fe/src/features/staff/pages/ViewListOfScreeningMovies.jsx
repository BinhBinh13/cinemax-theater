import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import StaffSideBar from "../components/StaffSideBar";
import MovieFiltersBar from "../components/MovieFiltersBar";
import MovieGrid from "../components/MovieGrid";
import { getMovies } from "../services/movieService";

export default function ViewListOfScreeningMovies() {
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

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <StaffSideBar />
      <main className="flex-grow-1 p-4">
        <h4 className="fw-normal mb-4">Movie list</h4>
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        <MovieFiltersBar
          draftSearchText={draftSearchText}
          onDraftSearchTextChange={setDraftSearchText}
          onSearchClick={handleSearch}
        />
        {loading ? (
          <div className="text-muted">Loading movies...</div>
        ) : (
          <MovieGrid movies={filteredMovies} />
        )}
      </main>
    </div>
  );
}
