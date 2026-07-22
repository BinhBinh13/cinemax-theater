import { SEAT_COLORS } from '@/shared/utils/seatLayout';

/**
 * Renders a row x column seat grid with the standard Cinemax color scheme.
 * Purely presentational — callers decide the variant (color) per seat and
 * whether seats are interactive, so the same component works for the Staff
 * seat editor, the Customer theater browser, and the ticket booking page.
 *
 * @param {{label: string, seats: object[]}[]} rows
 * @param {(seat: object) => 'normal'|'vip'|'disabled'|'selected'} getSeatVariant
 * @param {(seat: object) => string} [getSeatLabel] defaults to `${seatRow}${seatColumn}`
 * @param {(seat: object) => string} [getSeatTitle]
 * @param {(seat: object) => void} [onSeatClick] omit to render read-only
 * @param {(e: React.MouseEvent, seat: object) => void} [onSeatContextMenu]
 * @param {(seat: object) => boolean} [isSeatClickable] defaults to always clickable
 *   when onSeatClick is given — pass this to block clicks on e.g. occupied seats
 *   while still allowing clicks on visually "disabled" seats (Staff reactivates
 *   a disabled seat by clicking it, so disabled != unclickable).
 */
export default function SeatGrid({
  rows,
  getSeatVariant,
  getSeatLabel,
  getSeatTitle,
  onSeatClick,
  onSeatContextMenu,
  isSeatClickable,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      {rows.map((row) => (
        <div key={row.label} style={{ display: 'flex', gap: 5 }}>
          {row.seats.map((seat) => {
            const variant = getSeatVariant(seat);
            const c = SEAT_COLORS[variant] || SEAT_COLORS.normal;
            const isVisuallyDisabled = variant === 'disabled';
            const isClickable = !!onSeatClick && (isSeatClickable ? isSeatClickable(seat) : true);

            return (
              <div
                key={seat.id ?? seat.seatId}
                className="seat-cell"
                onClick={isClickable ? () => onSeatClick(seat) : undefined}
                onContextMenu={onSeatContextMenu ? (e) => onSeatContextMenu(e, seat) : undefined}
                style={{
                  width: 40,
                  height: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  background: c.bg,
                  borderRadius: 2,
                  border: `1.5px solid ${c.border}`,
                  color: c.text,
                  cursor: !isClickable ? 'not-allowed' : 'pointer',
                  opacity: isVisuallyDisabled ? 0.6 : 1,
                  userSelect: 'none',
                }}
                title={getSeatTitle ? getSeatTitle(seat) : undefined}
              >
                {getSeatLabel ? getSeatLabel(seat) : `${seat.seatRow}${seat.seatColumn}`}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
