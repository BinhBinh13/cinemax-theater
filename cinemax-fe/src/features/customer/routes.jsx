import { Routes, Route } from "react-router-dom";
import MovieListPage from "./pages/MovieListPage";
import MovieDetailPage from "./pages/MovieDetailPage";

export default function CustomerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MovieListPage />} />
      <Route path="/movies" element={<MovieListPage />} />
      <Route path="/movies/:movieId" element={<MovieDetailPage />} />
    </Routes>
  );
}
