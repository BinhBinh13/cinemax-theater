// Seat visual states shared by every screen that renders a theater seat grid
// (Staff room management, Customer theater browser, Customer ticket booking).
export const SEAT_COLORS = {
  normal: { border: '#2e9b4f', text: '#1f7a3a', bg: '#fff' },
  vip: { border: '#d0342c', text: '#c0392b', bg: '#fff' },
  disabled: { border: '#ccc', text: '#aaa', bg: '#eee' },
  selected: { border: '#d0342c', text: '#fff', bg: '#d0342c' },
};

/**
 * Builds a dense row x column seat grid from a room's raw seat list (as
 * returned by GET /api/v1/rooms/:id/detail), filling in any row/column not
 * yet persisted in the DB with a virtual NORMAL/ACTIVE placeholder.
 */
export function buildSeatGrid(room) {
  const dbMap = {};
  (room.seats || []).forEach((s) => {
    dbMap[`${s.seatRow}_${s.seatColumn}`] = s;
  });

  const rows = [];
  for (let r = 0; r < (room.rowCount || 0); r++) {
    const rowLabel = String.fromCharCode(65 + r);
    const cols = [];
    for (let c = 1; c <= (room.columnCount || 0); c++) {
      const key = `${rowLabel}_${c}`;
      cols.push(
        dbMap[key] || {
          id: `new_${key}`,
          seatRow: rowLabel,
          seatColumn: c,
          seatType: 'NORMAL',
          status: 'ACTIVE',
        }
      );
    }
    rows.push({ label: rowLabel, seats: cols });
  }
  return rows;
}
