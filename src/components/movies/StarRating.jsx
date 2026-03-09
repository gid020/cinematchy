import React, { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ rating = 0, onRate, size = "md", readOnly = false }) {
    const [hovered, setHovered] = useState(0);
    const sizeClass = size === "lg" ? "w-8 h-8" : size === "md" ? "w-6 h-6" : "w-4 h-4";
    const gapClass = size === "lg" ? "gap-2" : "gap-1";

    return (
        <div className={`flex items-center ${gapClass}`}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = hovered ? star <= hovered : star <= rating;
                return (
                    <button
                        key={star}
                        disabled={readOnly}
                        onClick={() => onRate?.(star)}
                        onMouseEnter={() => !readOnly && setHovered(star)}
                        onMouseLeave={() => !readOnly && setHovered(0)}
                        className={`transition-all duration-150 ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-125"}`}
                    >
                        <Star
                            className={`${sizeClass} transition-colors duration-150 ${
                                filled
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-zinc-600"
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}