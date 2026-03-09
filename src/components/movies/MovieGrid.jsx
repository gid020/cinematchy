import React from "react";
import MovieCard from "./MovieCard";

export default function MovieGrid({ movies, watchlistIds = [], onToggleWatchlist, columns = "default" }) {
    const gridClass = columns === "large" 
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
        : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5";

    if (!movies?.length) {
        return (
            <div className="text-center py-16">
                <p className="text-zinc-500 text-lg">No movies found</p>
            </div>
        );
    }

    return (
        <div className={gridClass}>
            {movies.map((movie, index) => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={index}
                    isInWatchlist={watchlistIds.includes(movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                />
            ))}
        </div>
    );
}