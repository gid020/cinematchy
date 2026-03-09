import React from "react";
import { Star, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MovieCard({ movie, isInWatchlist, onToggleWatchlist, index = 0 }) {
    const fallbackPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="group relative"
        >
            <Link to={createPageUrl("MovieDetails") + `?id=${movie.id}`}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900">
                    <img
                        src={movie.poster_url || fallbackPoster}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="text-xs text-zinc-400 mb-1">{movie.release_year} • {movie.genre?.join(", ")}</p>
                        <p className="text-sm text-zinc-300 line-clamp-2">{movie.description}</p>
                    </div>
                </div>
            </Link>

            {onToggleWatchlist && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleWatchlist(movie.id);
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
                        isInWatchlist 
                            ? "bg-amber-500 text-black" 
                            : "bg-black/60 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100"
                    }`}
                >
                    {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
            )}

            <div className="mt-3 px-1">
                <h3 className="text-white font-medium text-sm truncate">{movie.title}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-amber-400 text-xs font-semibold">{movie.rating?.toFixed(1) || "N/A"}</span>
                    <span className="text-zinc-600 text-xs">•</span>
                    <span className="text-zinc-500 text-xs">{movie.release_year}</span>
                </div>
            </div>
        </motion.div>
    );
}