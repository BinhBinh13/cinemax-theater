import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getScheduleById, getScheduleSeats, getFoodDrinks, createBooking } from "../services/BookingService";

export default function BookingPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  // Data states
  const [schedule, setSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Step state (1: Seats, 2: Snacks, 3: Details)
  const [step, setStep] = useState(1);

  // Selected items states
  const [selectedSeats, setSelectedSeats] = useState([]); // Array of seat objects
  const [selectedSnacks, setSelectedSnacks] = useState({}); // Mapping of foodDrinkId -> quantity
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([
      getScheduleById(scheduleId),
      getScheduleSeats(scheduleId),
      getFoodDrinks(),
    ])
      .then(([schedData, seatsData, snacksData]) => {
        if (!mounted) return;
        setSchedule(schedData);
        setSeats(seatsData);
        // Only show active snacks
        setSnacks(snacksData.filter(s => s.status !== "INACTIVE"));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.message || err.message || "Failed to load booking details.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [scheduleId]);

  const handleSeatClick = (seat) => {
    if (seat.occupied) return;
    const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatId !== seat.seatId));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleSnackQtyChange = (snackId, change) => {
    const currentQty = selectedSnacks[snackId] || 0;
    const newQty = Math.max(0, currentQty + change);
    setSelectedSnacks({
      ...selectedSnacks,
      [snackId]: newQty,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  // Calculations
  const ticketTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const snacksTotal = Object.entries(selectedSnacks).reduce((sum, [snackId, qty]) => {
    const snackItem = snacks.find((s) => s.id === parseInt(snackId));
    if (!snackItem) return sum;
    return sum + snackItem.price * qty;
  }, 0);

  const grandTotal = ticketTotal + snacksTotal;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
      setError("Please fill out all contact information fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    // Prepare food payload
    const foodPayload = Object.entries(selectedSnacks)
      .filter(([_, qty]) => qty > 0)
      .map(([snackId, qty]) => ({
        foodDrinkId: parseInt(snackId),
        quantity: qty,
      }));

    const payload = {
      scheduleId: parseInt(scheduleId),
      fullName: customerInfo.fullName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      seatIds: selectedSeats.map((s) => s.seatId),
      foods: foodPayload,
    };

    createBooking(payload)
      .then((res) => {
        if (res.paymentUrl) {
          // Redirect to VNPAY sandbox
          window.location.href = res.paymentUrl;
        } else {
          setError("Failed to generate payment URL. Please try again.");
          setSubmitting(false);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to initiate booking checkout.");
        setSubmitting(false);
      });
  };

  // Group seats by row for layout grid
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.seatRow]) {
      acc[seat.seatRow] = [];
    }
    acc[seat.seatRow].push(seat);
    return acc;
  }, {});

  // Sort columns in each row
  Object.keys(seatsByRow).forEach((row) => {
    seatsByRow[row].sort((a, b) => a.seatColumn - b.seatColumn);
  });

  const sortedRowKeys = Object.keys(seatsByRow).sort();

  if (loading) {
    return (
      <div className="container text-center py-5 my-5">
        <div className="spinner-border text-danger" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted fs-5">Loading seat layout and snack menu...</p>
      </div>
    );
  }

  if (error && !schedule) {
    return (
      <div className="container text-center py-5 my-5">
        <div className="alert alert-danger d-inline-block px-5" role="alert">
          <h4 className="alert-heading"><i className="fa fa-exclamation-triangle me-2"></i>Error</h4>
          <p className="mb-0">{error}</p>
        </div>
        <div className="mt-4">
          <Link className="btn btn-dark px-4 py-2" to="/">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-5">

      {/* Breadcrumb Steps */}
      <section className="bg-light py-3 border-bottom">
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold text-dark">Ticket Booking</h4>
            <div className="d-flex align-items-center gap-3">
              <span className={`badge rounded-pill px-3 py-2 ${step === 1 ? "bg-danger" : "bg-secondary"}`}>1. Select Seats</span>
              <i className="fa fa-chevron-right text-muted small"></i>
              <span className={`badge rounded-pill px-3 py-2 ${step === 2 ? "bg-danger" : "bg-secondary"}`}>2. Select Snacks</span>
              <i className="fa fa-chevron-right text-muted small"></i>
              <span className={`badge rounded-pill px-3 py-2 ${step === 3 ? "bg-danger" : "bg-secondary"}`}>3. Payment</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-xl my-4 flex-grow-1">
        {error && (
          <div className="alert alert-danger py-3 mb-4" role="alert">
            <i className="fa fa-exclamation-circle me-2"></i> {error}
          </div>
        )}

        <div className="row g-4">
          {/* Main Booking Panel */}
          <div className="col-lg-8">
            <div className="card shadow-sm border border-light p-4 h-100">
              
              {/* STEP 1: SEATS */}
              {step === 1 && (
                <div>
                  <h5 className="fw-bold text-secondary border-bottom pb-2 mb-4">
                    <i className="fa fa-th me-2 text-danger"></i>Select Seats
                  </h5>

                  {/* Screen visualization */}
                  <div className="text-center mb-5">
                    <div
                      className="mx-auto text-white fw-bold py-2 rounded-bottom-pill shadow-sm"
                      style={{
                        maxWidth: "450px",
                        backgroundColor: "#343a40",
                        fontSize: "13px",
                        letterSpacing: "4px",
                      }}
                    >
                      SCREEN
                    </div>
                  </div>

                  {/* Seat grid */}
                  <div className="text-center overflow-auto mb-4 py-2 border rounded bg-light p-3">
                    {sortedRowKeys.map((row) => (
                      <div key={row} className="d-flex justify-content-center align-items-center mb-1">
                        <span className="fw-bold text-muted me-3" style={{ width: "20px" }}>{row}</span>
                        {seatsByRow[row].map((seat) => {
                          const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
                          let seatClass = "btn-outline-dark";
                          
                          if (seat.occupied) {
                            seatClass = "btn-secondary text-white disabled-seat";
                          } else if (isSelected) {
                            seatClass = "btn-danger text-white";
                          } else if (seat.seatType === "VIP") {
                            seatClass = "btn-outline-warning";
                          } else if (seat.seatType === "COUPLE") {
                            seatClass = "btn-outline-info";
                          }

                          return (
                            <button
                              key={seat.seatId}
                              disabled={seat.occupied || seat.status === "DISABLED"}
                              className={`btn m-1 p-0 fw-bold d-flex align-items-center justify-content-center ${seatClass}`}
                              style={{
                                width: seat.seatType === "COUPLE" ? "80px" : "40px",
                                height: "40px",
                                fontSize: "11px",
                                cursor: seat.occupied ? "not-allowed" : "pointer"
                              }}
                              onClick={() => handleSeatClick(seat)}
                              title={
                                seat.occupied 
                                  ? `Seat ${row}${seat.seatColumn} (Occupied)` 
                                  : `Seat ${row}${seat.seatColumn} (${seat.seatType}) - ${seat.price.toLocaleString()} VND`
                              }
                            >
                              {row}{seat.seatColumn}
                            </button>
                          );
                        })}
                        <span className="fw-bold text-muted ms-3" style={{ width: "20px" }}>{row}</span>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="d-flex flex-wrap justify-content-center gap-4 mb-4 text-muted small">
                    <div className="d-flex align-items-center">
                      <span className="d-inline-block border border-dark me-2 bg-white" style={{ width: "20px", height: "20px", borderRadius: "4px" }}></span>
                      <span>Standard</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-block border border-warning me-2 bg-white" style={{ width: "20px", height: "20px", borderRadius: "4px" }}></span>
                      <span className="text-warning fw-semibold">VIP (+20K)</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-block border border-info me-2 bg-white" style={{ width: "40px", height: "20px", borderRadius: "4px" }}></span>
                      <span className="text-info fw-semibold">Couple (Double)</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-block bg-danger me-2" style={{ width: "20px", height: "20px", borderRadius: "4px" }}></span>
                      <span className="text-danger fw-semibold">Selected</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-block bg-secondary me-2" style={{ width: "20px", height: "20px", borderRadius: "4px" }}></span>
                      <span>Occupied / Disabled</span>
                    </div>
                  </div>

                  {/* Next Action */}
                  <div className="d-flex justify-content-end border-top pt-4">
                    <button
                      className="btn btn-danger btn-lg px-5 py-3 fw-bold rounded-pill shadow-sm"
                      disabled={selectedSeats.length === 0}
                      onClick={() => setStep(2)}
                    >
                      Next: Select Snacks <i className="fa fa-chevron-right ms-2"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SNACKS */}
              {step === 2 && (
                <div>
                  <h5 className="fw-bold text-secondary border-bottom pb-2 mb-4">
                    <i className="fa fa-cutlery me-2 text-danger"></i>Select Foods & Drinks
                  </h5>

                  {snacks.length === 0 ? (
                    <div className="alert alert-info py-4 text-center">
                      <i className="fa fa-info-circle fs-3 d-block mb-2"></i>
                      No snacks or drinks are currently available at this theater.
                    </div>
                  ) : (
                    <div className="row row-cols-1 row-cols-md-2 g-4 mb-4">
                      {snacks.map((snack) => {
                        const qty = selectedSnacks[snack.id] || 0;
                        return (
                          <div key={snack.id} className="col">
                            <div className="card h-100 border-light bg-light-hover shadow-xs">
                              <div className="row g-0 align-items-center h-100">
                                <div className="col-4">
                                  <img
                                    src={snack.imageURL || "https://picsum.photos/id/1062/200/200"}
                                    alt={snack.itemName}
                                    className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                                    style={{ minHeight: "100px", maxHeight: "120px" }}
                                  />
                                </div>
                                <div className="col-8">
                                  <div className="card-body py-2 px-3">
                                    <h6 className="card-title fw-bold text-dark mb-1">{snack.itemName}</h6>
                                    <p className="card-text text-danger fw-bold mb-2">
                                      {snack.price.toLocaleString("vi-VN")} VND
                                    </p>
                                    <div className="d-flex align-items-center">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary px-2.5 py-1"
                                        disabled={qty === 0}
                                        onClick={() => handleSnackQtyChange(snack.id, -1)}
                                      >
                                        <i className="fa fa-minus"></i>
                                      </button>
                                      <span className="mx-3 fw-bold text-dark fs-6" style={{ minWidth: "15px", textAlign: "center" }}>{qty}</span>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary px-2.5 py-1"
                                        disabled={qty >= snack.quantityInStock}
                                        onClick={() => handleSnackQtyChange(snack.id, 1)}
                                      >
                                        <i className="fa fa-plus"></i>
                                      </button>
                                      <small className="text-muted ms-2">Stock: {snack.quantityInStock}</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between border-top pt-4">
                    <button
                      className="btn btn-outline-secondary btn-lg px-4 py-2.5 rounded-pill"
                      onClick={() => setStep(1)}
                    >
                      <i className="fa fa-chevron-left me-2"></i> Back to Seats
                    </button>
                    <button
                      className="btn btn-danger btn-lg px-5 py-2.5 fw-bold rounded-pill shadow-sm"
                      onClick={() => setStep(3)}
                    >
                      Next: Contact Info <i className="fa fa-chevron-right ms-2"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DETAILS */}
              {step === 3 && (
                <div>
                  <h5 className="fw-bold text-secondary border-bottom pb-2 mb-4">
                    <i className="fa fa-id-card-o me-2 text-danger"></i>Contact Information
                  </h5>

                  <form onSubmit={handleCheckoutSubmit}>
                    <div className="mb-3">
                      <label htmlFor="fullName" className="form-label fw-semibold text-dark">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control py-2.5"
                        id="fullName"
                        name="fullName"
                        required
                        placeholder="e.g. Nguyen Van A"
                        value={customerInfo.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-semibold text-dark">Email Address <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          className="form-control py-2.5"
                          id="email"
                          name="email"
                          required
                          placeholder="e.g. email@domain.com"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label fw-semibold text-dark">Phone Number <span className="text-danger">*</span></label>
                        <input
                          type="tel"
                          className="form-control py-2.5"
                          id="phone"
                          name="phone"
                          required
                          placeholder="e.g. 09xxxxxxxx"
                          value={customerInfo.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis p-3 rounded mb-4">
                      <h6 className="fw-bold mb-1"><i className="fa fa-shield me-2"></i>Secure VNPAY Payment</h6>
                      <p className="small mb-0">By clicking "Pay with VNPAY", you will be redirected to the secure VNPAY Payment Gateway sandbox to complete your transaction.</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-between border-top pt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg px-4 py-2.5 rounded-pill"
                        disabled={submitting}
                        onClick={() => setStep(2)}
                      >
                        <i className="fa fa-chevron-left me-2"></i> Back to Snacks
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-danger btn-lg px-5 py-2.5 fw-bold rounded-pill shadow-sm d-flex align-items-center"
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing Checkout...
                          </>
                        ) : (
                          <>
                            Pay with VNPAY <i className="fa fa-credit-card-alt ms-2"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="col-lg-4">
            <div className="card shadow-sm border border-light p-4 text-start">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Booking Summary</h5>
              
              <div className="mb-4">
                <h6 className="fw-bold text-danger mb-1 fs-5">{schedule.movieTitle}</h6>
                <div className="small text-muted mb-3">
                  <span className="badge bg-light text-dark border me-1.5">{schedule.status}</span>
                </div>

                <div className="d-flex flex-column gap-2.5 border-top pt-3 fs-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Showtime:</span>
                    <strong className="text-dark">
                      {new Date(schedule.startTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Date:</span>
                    <strong className="text-dark">
                      {new Date(schedule.startTime).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Room:</span>
                    <strong className="text-dark">{schedule.roomName}</strong>
                  </div>
                </div>
              </div>

              {/* Selected Seats summary */}
              <div className="border-top pt-3 mb-3">
                <h6 className="fw-bold text-secondary mb-2 fs-6">Selected Seats</h6>
                {selectedSeats.length === 0 ? (
                  <span className="text-muted small italic">No seats selected yet.</span>
                ) : (
                  <div>
                    <div className="d-flex flex-wrap gap-1.5 mb-2">
                      {selectedSeats.map((seat) => (
                        <span key={seat.seatId} className="badge bg-danger rounded-1">
                          {seat.seatRow}{seat.seatColumn}
                        </span>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Tickets Subtotal:</span>
                      <strong>{ticketTotal.toLocaleString("vi-VN")} VND</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Snacks summary */}
              <div className="border-top pt-3 mb-4">
                <h6 className="fw-bold text-secondary mb-2 fs-6">Snacks & Drinks</h6>
                {Object.values(selectedSnacks).every(qty => qty === 0) ? (
                  <span className="text-muted small italic">No snacks selected.</span>
                ) : (
                  <div>
                    <div className="d-flex flex-column gap-1.5 mb-2">
                      {Object.entries(selectedSnacks).map(([snackId, qty]) => {
                        if (qty === 0) return null;
                        const item = snacks.find(s => s.id === parseInt(snackId));
                        if (!item) return null;
                        return (
                          <div key={snackId} className="d-flex justify-content-between small text-dark">
                            <span>{item.itemName} (x{qty})</span>
                            <span>{(item.price * qty).toLocaleString("vi-VN")} VND</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Snacks Subtotal:</span>
                      <strong>{snacksTotal.toLocaleString("vi-VN")} VND</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark fs-5">Grand Total:</span>
                <strong className="text-success fs-4">{grandTotal.toLocaleString("vi-VN")} VND</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
