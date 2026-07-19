// features/movies/pages/MovieListPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import HeroSection from "../../../shared/components/HeroSection";
import { getMovies } from "@/features/customer/services/MovieService";

function MovieListPage() {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [language, setLanguage] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Fetch movies from API on mount
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError("");

        getMovies()
            .then((data) => {
                if (!mounted) return;
                setMovies(data);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err.message || "Failed to fetch movies from server.");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const resetFilters = () => {
        setSearchTerm("");
        setLanguage("");
        setCategory("");
        setStatus("");
        setSortBy("newest");
    };

    // Filter the movies dynamically based on client interaction
    const filteredMovies = movies.filter((movie) => {
        if (searchTerm && !movie.title.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
            return false;
        }
        if (language && movie.language !== language) {
            return false;
        }
        if (category) {
            const hasCategory = movie.categories?.some(
                (cat) => (cat.categoryName || cat).toLowerCase() === category.toLowerCase()
            );
            if (!hasCategory) return false;
        }
        if (status && movie.status !== status) {
            return false;
        }
        return true;
    });

    // Sort the movies list
    const sortedMovies = [...filteredMovies].sort((a, b) => {
        if (sortBy === "title") {
            return a.title.localeCompare(b.title);
        }
        // Default (newest): Sort by ID descending
        return (b.id || 0) - (a.id || 0);
    });

    return (
        <>
            <HeroSection
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                language={language}
                setLanguage={setLanguage}
                category={category}
                setCategory={setCategory}
                status={status}
                setStatus={setStatus}
                sortBy={sortBy}
                setSortBy={setSortBy}
                languages={["Hindi", "Thai", "English", "Mandarin"]}
                categories={[
                    "Action",
                    "Comedy",
                    "Drama",
                    "Horror",
                    "Romance",
                    "Thriller",
                ]}
                onReset={resetFilters}
            />

            <div className="container mt-4 mb-5">
                {error && (
                    <div className="alert alert-danger py-3 text-center my-4" role="alert">
                        <i className="fa fa-exclamation-triangle me-2"></i> {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading movies list...</p>
                    </div>
                ) : sortedMovies.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="fa fa-film fs-1 text-muted mb-3 d-block"></i>
                        <h5 className="text-secondary fw-semibold">No movies match your filters</h5>
                        <button className="btn btn-outline-danger mt-3 px-4" onClick={resetFilters}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="row">
                        {sortedMovies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onMovieClick={(id) => navigate(`/movies/${id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default MovieListPage;