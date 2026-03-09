import React from "react";

const genreColors = {
    "Action": "from-red-500/20 to-orange-500/20 text-red-300 border-red-500/30",
    "Comedy": "from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30",
    "Drama": "from-purple-500/20 to-violet-500/20 text-purple-300 border-purple-500/30",
    "Sci-Fi": "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
    "Romance": "from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30",
    "Thriller": "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
};

export default function GenrePill({ genre, selected, onClick, size = "md" }) {
    const colors = genreColors[genre] || "from-zinc-500/20 to-zinc-500/20 text-zinc-300 border-zinc-500/30";
    const sizeClasses = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";
    
    return (
        <button
            onClick={() => onClick?.(genre)}
            className={`bg-gradient-to-r ${colors} border rounded-full font-medium transition-all duration-200 ${sizeClasses} ${
                selected ? "ring-2 ring-white/30 scale-105" : "hover:scale-105"
            }`}
        >
            {genre}
        </button>
    );
}