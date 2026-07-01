import { Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

export default function MovieCard({ movie }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/staff/movies/${movie.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <Card className="h-100 shadow-sm">
        <div
          style={{
            aspectRatio: '3/4',
            overflow: 'hidden',
            background: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {movie.poster ? (
            <Card.Img
              variant="top"
              src={movie.poster}
              alt={movie.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <span style={{ color: '#6b7280', fontSize: 13 }}>
              No Image
            </span>
          )}
        </div>

        <Card.Footer
          className="text-center py-2"
          style={{ fontSize: 13, color: '#111' }}
        >
          {movie.title}
        </Card.Footer>
      </Card>
    </div>
  )
}