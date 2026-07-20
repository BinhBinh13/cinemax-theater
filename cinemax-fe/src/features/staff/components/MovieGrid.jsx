import MovieCard from './MovieCard'

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
}

export default function MovieGrid({ movies, onDelete }) {
  if (!movies || movies.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: 14 }}>
        No movies found.
      </div>
    )
  }

  return (
    <div style={styles.grid}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onDelete={onDelete} />
      ))}
    </div>
  )
}