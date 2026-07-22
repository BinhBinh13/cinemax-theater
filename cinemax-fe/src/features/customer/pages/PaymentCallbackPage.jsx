import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyPayment } from "../services/PaymentService";
import CustomerHeader from "@/shared/components/CustomerHeader";

function formatVnPayDate(dateStr) {
  if (!dateStr || dateStr.length < 14) return dateStr;
  // yyyyMMddHHmmss -> dd/MM/yyyy HH:mm:ss
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const hour = dateStr.slice(8, 10);
  const min = dateStr.slice(10, 12);
  const sec = dateStr.slice(12, 14);
  return `${day}/${month}/${year} ${hour}:${min}:${sec}`;
}

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    // Gather all query params to verify signature
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    verifyPayment(params)
      .then((data) => {
        if (!mounted) return;
        setReceipt(data);
        if (data.status !== "CONFIRMED") {
          setError(`Payment failed or cancelled (VNPAY Response Code: ${params.vnp_ResponseCode || "Unknown"}).`);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.message || err.message || "Failed to verify transaction signature.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  return (
    <div className="cinemax-page-container d-flex flex-column min-vh-100">
      <CustomerHeader />
      <div className="pb-5">

      <div className="container-xl my-5 flex-grow-1 d-flex align-items-center justify-content-center">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" style={{ width: "3.5rem", height: "3.5rem" }}>
              <span className="visually-hidden">Verifying...</span>
            </div>
            <h4 className="fw-bold mt-4 text-dark">Verifying payment status...</h4>
            <p className="text-muted">Please do not refresh the page or click back.</p>
          </div>
        ) : error ? (
          <div className="card shadow border-0 p-4 text-center mx-auto" style={{ maxWidth: "500px" }}>
            <div className="mb-3 text-danger" style={{ fontSize: "5rem" }}>
              <i className="fa fa-times-circle-o"></i>
            </div>
            <h3 className="fw-bold text-dark mb-2">Booking Failed</h3>
            <p className="text-secondary mb-4">{error}</p>
            <div className="d-grid gap-2">
              <Link className="btn btn-danger py-2.5 rounded-pill fw-semibold" to="/">
                Back to Home Page
              </Link>
            </div>
          </div>
        ) : (
          receipt && (
            <div className="card shadow-lg border-0 p-4 text-center mx-auto" style={{ maxWidth: "600px", borderRadius: "15px" }}>
              <div className="mb-3 text-success" style={{ fontSize: "5rem" }}>
                <i className="fa fa-check-circle-o"></i>
              </div>
              <h3 className="fw-bold text-dark mb-1">Booking Confirmed!</h3>
              <p className="text-muted mb-4 fs-6">
                Thank you! Your tickets have been booked successfully.
              </p>

              {/* Receipt Body */}
              <div
                className="card border-dashed p-4 bg-light text-start mx-auto mb-4 w-100"
                style={{ border: "2px dashed #ddd", borderRadius: "10px" }}
              >
                <h6 className="text-uppercase text-muted fw-bold text-center mb-3">TICKET E-RECEIPT</h6>
                
                <h4 className="fw-bold text-danger text-center mb-4">{receipt.movieTitle}</h4>

                <div className="row g-3 fs-6">
                  {/* Left Column */}
                  <div className="col-sm-6">
                    <div className="mb-2">
                      <span className="text-muted small d-block">SHOWTIME</span>
                      <strong className="text-dark">{receipt.showtime}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small d-block">SCREENING ROOM</span>
                      <strong className="text-dark">{receipt.roomName}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small d-block">SEATS</span>
                      <strong className="text-dark">{receipt.seatCodes.join(", ")}</strong>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-sm-6">
                    <div className="mb-2">
                      <span className="text-muted small d-block">CUSTOMER NAME</span>
                      <strong className="text-dark">{receipt.fullName}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small d-block">PHONE NUMBER</span>
                      <strong className="text-dark">{receipt.phone}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small d-block">TRANSACTION DATE</span>
                      <strong className="text-dark">{formatVnPayDate(receipt.payDate)}</strong>
                    </div>
                  </div>

                  {/* Snacks lists if any */}
                  {receipt.foods && receipt.foods.length > 0 && (
                    <div className="col-12 mt-2 pt-3 border-top">
                      <span className="text-muted small d-block mb-1.5">SNACKS & DRINKS</span>
                      <div className="d-flex flex-column gap-1 bg-white p-2 rounded border">
                        {receipt.foods.map((food, idx) => (
                          <div key={idx} className="d-flex justify-content-between small text-secondary">
                            <span>{food.itemName} (x{food.quantity})</span>
                            <span className="fw-semibold text-dark">{ (food.price * food.quantity).toLocaleString() } VND</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Booking Code & Total */}
                  <div className="col-12 mt-3 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold text-dark fs-5">Total Paid:</span>
                      <strong className="text-success fs-4">{receipt.totalAmount.toLocaleString("vi-VN")} VND</strong>
                    </div>
                    
                    <div className="p-3 bg-white border text-center" style={{ borderRadius: "8px" }}>
                      <span className="d-block text-muted small fw-bold mb-1">BOOKING CODE</span>
                      <span className="fs-3 fw-bold text-dark tracking-wider">{receipt.txnRef}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2">
                <Link className="btn btn-dark py-2.5 rounded-pill fw-semibold" to="/">
                  Back to Movies List
                </Link>
              </div>
            </div>
          )
        )}
      </div>

      </div>
    </div>
  );
}
