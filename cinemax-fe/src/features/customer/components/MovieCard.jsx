import React from "react";

const MovieCard = ({ movie, onMovieClick }) => {
    const categories = movie.categories || [];
    const catNames =
        categories.map((c) => c.categoryName || c).join(", ") || "Action, Drama";

    const handleClick = () => {
        const id = movie.movieId || movie.id;
        if (onMovieClick && id) {
            onMovieClick(id);
        }
    };

    const imageSrc = movie.bannerPath || movie.poster || "https://picsum.photos/id/237/400/600";
    const language = movie.language || "English";
    const duration = movie.duration || movie.durationMinutes || 0;

    return (
        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div
                className="trend_2i position-relative shadow-sm rounded overflow-hidden"
                style={{
                    cursor: "pointer",
                    transition: "transform 0.3s",
                }}
                onClick={handleClick}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                }}
            >
                <img
                    src={imageSrc}
                    alt={movie.title}
                    className="w-100"
                    style={{
                        height: "420px",
                        objectFit: "cover",
                    }}
                />

                <div
                    className="position-absolute bottom-0 w-100 p-3"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
                    }}
                >
                    <h6
                        className="text-white fw-bold text-truncate mb-1"
                        style={{ fontSize: "1.1rem" }}
                        title={movie.title}
                    >
                        {movie.title}
                    </h6>

                    <small
                        className="text-light d-block text-truncate mb-1"
                        style={{ fontSize: "0.85rem" }}
                        title={`${catNames} | ${language}`}
                    >
                        {catNames}
                        <span className="mx-1 text-white-50">|</span>
                        <span className="text-warning fw-bold">
                            {language}
                        </span>
                    </small>

                    <small
                        className="fw-bold"
                        style={{
                            color: "#eb7a18",
                            fontSize: "0.85rem",
                        }}
                    >
                        <i className="fa fa-clock-o me-1"></i>
                        {duration} Mins
                    </small>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;