
const styles = {
  bar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 24,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 500,
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    background: '#fff',
    overflow: 'hidden',
    height: 34,
  },
  searchIcon: {
    padding: '0 10px',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: 13,
    width: 210,
    background: 'transparent',
    color: '#111827',
  },
  input: {
    height: 34,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    padding: '0 10px',
    fontSize: 13,
    color: '#111827',
    background: '#fff',
    outline: 'none',
  },
  select: {
    height: 34,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    padding: '0 10px',
    fontSize: 13,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    width: 150,
    cursor: 'pointer',
  },
}

export default function MovieFiltersBar({
  draftSearchText,
  onDraftSearchTextChange,
  onSearchClick,
}) {
  return (
    <div style={styles.bar}>
      <div style={styles.group}>
        <span style={styles.label}>Search</span>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search movie by name..."
            style={styles.searchInput}
            value={draftSearchText}
            onChange={(e) => onDraftSearchTextChange(e.target.value)}
          />
        </div>
      </div>



      <button
        type="button"
        onClick={onSearchClick}
        style={{
          height: 34,
          borderRadius: 6,
          border: '1px solid #2563eb',
          background: '#2563eb',
          color: '#fff',
          padding: '0 16px',
          cursor: 'pointer',
          alignSelf: 'flex-end',
        }}
      >
        Search
      </button>
    </div>
  )
}