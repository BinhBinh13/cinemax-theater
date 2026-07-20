import { Form, Button } from 'react-bootstrap'

export default function MovieFiltersBar({
  draftSearchText,
  onDraftSearchTextChange,
  onSearchClick,
}) {
  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      <Form.Control
        type="text"
        placeholder="Search movie by name..."
        style={{ maxWidth: 280 }}
        value={draftSearchText}
        onChange={(e) => onDraftSearchTextChange(e.target.value)}
      />
      <Button variant="danger" onClick={onSearchClick}>
        Search
      </Button>
    </div>
  )
}
