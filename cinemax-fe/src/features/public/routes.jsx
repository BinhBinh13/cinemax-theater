import { Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import MovieListPage from './pages/MovieListPage.jsx'

const PublicRoutes = (
  <>
    <Route path="/" element={<HomePage />} />
    <Route path="/movies" element={<MovieListPage />} />
  </>
)

export default PublicRoutes