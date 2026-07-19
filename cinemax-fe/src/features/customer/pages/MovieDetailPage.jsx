import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById, getScheduleByMovieId } from "@/features/customer/services/MovieService";

// Helper functions for date formatting matching MovieScheduleDetail
function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatDisplayDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function toDatePart(isoDateTime) {
    return isoDateTime.slice(0, 10);
}

function toTimePart(isoDateTime) {
    return isoDateTime.slice(11, 16);
}

function groupByDate(schedules) {
    if (!schedules) return [];
    return Object.entries(
        schedules.reduce((acc, st) => {
            const date = toDatePart(st.startTime);
            if (acc[date] === undefined) acc[date] = [];
            acc[date].push(st);
            return acc;
        }, {})
    );
}

// Mock database data removed. Movie details are now fully driven by API and database.

export default function MovieDetailPage() {
    const { movieId } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showVideo, setShowVideo] = useState(false);

    // Booking states
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [bookingCode, setBookingCode] = useState("");

    // Load FontAwesome icons stylesheet dynamically
    useEffect(() => {
        if (!document.getElementById("font-awesome-cdn")) {
            const link = document.createElement("link");
            link.id = "font-awesome-cdn";
            link.rel = "stylesheet";
            link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
            document.head.appendChild(link);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError("");

        Promise.all([getMovieById(movieId), getScheduleByMovieId(movieId)])
            .then(([movieData, scheduleResponse]) => {
                if (!mounted) return;
                setMovie(movieData);
                setSchedules(scheduleResponse.data);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err.message || "Failed to load movie details.");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [movieId]);

    const goBack = () => {
        // Navigate back to Movie List Page or go back in history
        navigate(-1);
    };

    const openBookingModal = () => {
        // Reset booking states
        setSelectedDate("");
        setSelectedSchedule(null);
        setSelectedSeats([]);
        setBookingConfirmed(false);
        setBookingCode("");
        setShowBookingModal(true);
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
    };

    const handleSeatClick = (seatCode) => {
        if (selectedSeats.includes(seatCode)) {
            setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
        } else {
            setSelectedSeats([...selectedSeats, seatCode]);
        }
    };

    const confirmBooking = () => {
        if (selectedSeats.length === 0) return;
        const randomCode = "CTBS-" + Math.floor(100000 + Math.random() * 900000);
        setBookingCode(randomCode);
        setBookingConfirmed(true);
    };

    if (loading) {
        return (
            <div className="container text-center py-5 my-5">
                <div className="spinner-border text-danger" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fs-5">Loading movie details...</p>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="container text-center py-5 my-5">
                <div className="alert alert-danger d-inline-block px-5" role="alert">
                    <h4 className="alert-heading"><i className="fa fa-exclamation-triangle me-2"></i>Error</h4>
                    <p className="mb-0">{error || "Movie not found or server is down."}</p>
                </div>
                <div className="mt-4">
                    <button className="btn btn-dark px-4 py-2" onClick={() => navigate("/")}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Combine category array from API or fallback
    const categoriesList = movie.categories || [];
    const categoriesText = categoriesList.map((c) => c.categoryName || c).join(", ") || "Categories";
    const movieDuration = movie.duration || 0;

    // Group schedules for booking
    const groupedSchedules = groupByDate(schedules);

    // Seat Configuration for Booking Screen
    const rows = ["A", "B", "C", "D", "E"];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8];
    // Mock some pre-booked seats
    const reservedSeats = ["A3", "B5", "C6", "D2", "E4"];

    return (
        <div className="home-light-theme pb-5">
            {/* Styles for play button and styling detail container */}
            <style>
                {`
          .custom-play-btn {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 80px;
              height: 80px;
              background: rgba(217, 108, 44, 0.85);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white !important;
              font-size: 30px;
              cursor: pointer;
              z-index: 10;
              transition: all 0.3s ease;
              box-shadow: 0 0 15px rgba(217, 108, 44, 0.5);
          }

          .custom-play-btn:hover {
              background: #d96c2c;
              transform: translate(-50%, -50%) scale(1.1);
              box-shadow: 0 0 25px rgba(217, 108, 44, 0.8);
          }

          .movie-main-info {
              background: #f8f9fa;
              border-radius: 15px;
              padding: 25px;
              border: 1px solid #e9ecef;
          }

          .seat-btn {
            width: 38px;
            height: 38px;
            margin: 4px;
            font-size: 11px;
            font-weight: bold;
            border-radius: 6px;
            border: 1px solid #ddd;
            background-color: #fff;
            color: #333;
            transition: all 0.2s;
            cursor: pointer;
          }
          
          .seat-btn.selected {
            background-color: #d96c2c;
            color: #fff;
            border-color: #d96c2c;
          }

          .seat-btn.reserved {
            background-color: #e9ecef;
            color: #adb5bd;
            border-color: #e9ecef;
            cursor: not-allowed;
          }
        `}
            </style>

            {/* Header Breadcrumb Section */}
            <section className="centre_o pt-5 pb-5 bg-light" id="center">
                <div className="container-xl">
                    <div className="row centre_o1 text-center">
                        <div className="col-md-12">
                            <h1 className="fw-bold text-dark mb-1">Movie Details</h1>
                            <h5 className="mb-0 mt-2">
                                <a className="text-decoration-none" style={{ color: "#d96c2c" }} href="/">
                                    Home
                                </a>
                                <span className="mx-2 text-muted">/</span>
                                <span className="text-secondary">Details</span>
                            </h5>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Details Section */}
            <section className="p_3 mt-4 mb-5" id="detail" style={{ flexGrow: 1 }}>
                <div className="container-xl">
                    {/* Back button */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={goBack}>
                                <i className="fa fa-arrow-left me-2"></i> Back to Movies
                            </button>
                        </div>
                    </div>

                    {/* Heading title area */}
                    <div className="row align-items-end mb-4">
                        <div className="col-md-8">
                            <h2 className="fw-bold display-5 mb-1" id="movieTitle">
                                {movie.title || "Untitled"}
                            </h2>
                            <h6 className="text-muted fs-5" id="movieMeta">
                                {categoriesText} / {movieDuration} Mins
                            </h6>
                        </div>
                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                            <button
                                className="btn btn-danger btn-lg px-5 py-3 fw-bold shadow-sm"
                                id="btnGetTicket"
                                onClick={openBookingModal}
                            >
                                <i className="fa fa-ticket me-2"></i> GET TICKET
                            </button>
                        </div>
                    </div>

                    {/* Poster and media columns */}
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="rounded shadow overflow-hidden position-relative border">
                                <img
                                    alt="Poster"
                                    className="w-100"
                                    id="moviePoster"
                                    style={{ height: "550px", objectFit: "cover" }}
                                    src={movie.poster || "https://picsum.photos/id/237/400/600"}
                                />
                            </div>
                        </div>

                        <div className="col-md-8">
                            {/* Media Player wrapper */}
                            <div
                                className="position-relative rounded shadow overflow-hidden mb-4 border"
                                id="mediaWrapper"
                                style={{ height: "380px", backgroundColor: "#000" }}
                            >
                                {showVideo ? (
                                    <div className="w-100 h-100" id="videoContainer">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`${movie.trailerUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}?autoplay=1`}
                                            title={`${movie.title} Trailer`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="w-100 h-100 position-relative" id="bannerContainer">
                                        <img
                                            alt="Banner"
                                            className="w-100 h-100"
                                            id="movieBanner"
                                            style={{ objectFit: "cover", opacity: 0.85 }}
                                            src={movie.bannerUrl || movie.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop"}
                                        />
                                        <div className="custom-play-btn" id="customPlayBtn" onClick={() => setShowVideo(true)}>
                                            <i className="fa fa-play"></i>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Main movie facts sheet */}
                            <div className="movie-main-info shadow-sm">
                                <div className="row">
                                    <div className="col-sm-6">
                                        <p className="mb-2 text-muted">
                                            <strong className="text-dark">Director: </strong>
                                            <span id="movieDirector">{movie.director || "Unknown"}</span>
                                        </p>
                                        <p className="mb-2 text-muted">
                                            <strong className="text-dark">Release Date: </strong>
                                            <span id="movieRelease">{formatDate(movie.screeningStart) || "N/A"}</span>
                                        </p>
                                        <p className="mb-2 text-muted">
                                            <strong className="text-dark">Language: </strong>
                                            <span className="badge bg-primary text-uppercase px-2.5 py-1.5" id="detailLanguage">
                                                {movie.language || "N/A"}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-sm-6">
                                        <p className="mb-2 text-muted">
                                            <strong className="text-dark">Rating: </strong>
                                            <span className="fw-bold text-danger fs-5" id="movieRating">
                                                {movie.rating || "N/A"}
                                            </span>
                                            <small> / 10</small>
                                        </p>
                                        <p className="mb-2 text-muted">
                                            <strong className="text-dark">Cast: </strong>
                                            <span id="movieActors">{movie.actors || "Unknown"}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Storyline Row */}
                    <div className="row mt-5">
                        <div className="col-12">
                            <h3 className="fw-bold border-bottom pb-3 mb-4">
                                <i className="fa fa-align-left text-danger me-2"></i>
                                <span>Storyline</span>
                            </h3>
                            <p className="fs-5 text-secondary lh-lg" id="movieDesc">
                                {movie.description || "No description available for this movie."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Ticket Modal (Standard HTML & Bootstrap implementation) */}
            {showBookingModal && (
                <>
                    <div
                        className="modal fade show"
                        style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1050 }}
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "15px" }}>

                                {/* Modal Header */}
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h4 className="modal-title fw-bold text-dark d-flex align-items-center">
                                        <i className="fa fa-ticket text-danger me-2"></i>
                                        Get Tickets - {movie.title}
                                    </h4>
                                    <button type="button" className="btn-close" onClick={closeBookingModal} aria-label="Close"></button>
                                </div>

                                {/* Modal Body */}
                                <div className="modal-body py-4 px-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                                    <div>
                                        <h5 className="fw-bold text-secondary mb-3">Select Screening Date & Time</h5>
                                        {groupedSchedules.length === 0 ? (
                                            <div className="alert alert-warning text-center my-4 py-4" role="alert">
                                                <i className="fa fa-info-circle fs-3 d-block mb-2"></i>
                                                No active screening schedules found for this movie.
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column gap-4">
                                                {groupedSchedules.map(([date, dateSchedules]) => (
                                                    <div key={date} className="pb-3 border-bottom">
                                                        <h6 className="fw-bold text-primary mb-2.5">
                                                            <i className="fa fa-calendar-o me-2"></i>
                                                            {formatDisplayDate(date)}
                                                        </h6>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {dateSchedules.map((sched) => (
                                                                <button
                                                                    key={sched.id}
                                                                    className="btn btn-outline-danger px-3 py-2 text-start"
                                                                    style={{ minWidth: "160px" }}
                                                                    onClick={() => {
                                                                        closeBookingModal();
                                                                        navigate(`/booking/${sched.id}`);
                                                                    }}
                                                                >
                                                                    <span className="fw-bold d-block fs-5">{toTimePart(sched.startTime)}</span>
                                                                    <span className="small text-muted d-block mt-0.5">Room: {sched.roomName}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    {/* Modal Overlay Backdrop */}
                    <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
                </>
            )}

        </div>
    );
}
