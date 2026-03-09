import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StarRating from "../components/movies/StarRating";
import GenrePill from "../components/movies/GenrePill";
import { motion } from "framer-motion";
import { Loader2, Bookmark, BookmarkCheck, Calendar, TrendingUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function MovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get("id");
    const queryClient = useQueryClient();

    const [user, setUser] = useState(null);
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
    }, []);

    const { data: movie, isLoading: movieLoading } = useQuery({
        queryKey: ["movie", movieId],
        queryFn: async () => {
            const movies = await base44.entities.Movies.filter({ id: movieId });
            return movies[0];
        },
        enabled: !!movieId,
    });

    const { data: userRating } = useQuery({
        queryKey: ["user-rating", user?.id, movieId],
        queryFn: async () => {
            const ratings = await base44.entities.Ratings.filter({ user_id: user.id, movie_id: movieId });
            return ratings[0] || null;
        },
        enabled: !!user && !!movieId,
    });

    useEffect(() => {
        if (!user || !movieId) return;
        base44.entities.Watchlist.filter({ user_id: user.id, movie_id: movieId }).then((items) => {
            setIsInWatchlist(items.length > 0);
        });
    }, [user, movieId]);

    const rateMutation = useMutation({
        mutationFn: async (rating) => {
            if (userRating) {
                await base44.entities.Ratings.update(userRating.id, { rating });
            } else {
                await base44.entities.Ratings.create({
                    user_id: user.id,
                    movie_id: movieId,
                    rating,
                    created_at: new Date().toISOString().split("T")[0],
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-rating", user?.id, movieId] });
            toast.success("Rating saved!");
        },
    });

    const handleToggleWatchlist = async () => {
        if (!user) {
            base44.auth.redirectToLogin();
            return;
        }
        if (isInWatchlist) {
            const items = await base44.entities.Watchlist.filter({ user_id: user.id, movie_id: movieId });
            if (items.length > 0) await base44.entities.Watchlist.delete(items[0].id);
            setIsInWatchlist(false);
            toast.success("Removed from watchlist");
        } else {
            await base44.entities.Watchlist.create({ user_id: user.id, movie_id: movieId });
            setIsInWatchlist(true);
            toast.success("Added to watchlist!");
        }
    };

    const handleRate = (rating) => {
        if (!user) {
            base44.auth.redirectToLogin();
            return;
        }
        rateMutation.mutate(rating);
    };

    if (movieLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-950">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
                <p className="text-zinc-500 text-lg">Movie not found</p>
                <Link to={createPageUrl("Home")} className="text-amber-400 mt-4 hover:underline">
                    Go back home
                </Link>
            </div>
        );
    }

    const fallbackPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=900&fit=crop`;

    return (
        <div className="bg-zinc-950 min-h-screen">
            {/* Hero Background */}
            <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                <img
                    src={movie.poster_url || fallbackPoster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent" />
                
                <Link
                    to={createPageUrl("Home")}
                    className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/30 backdrop-blur-sm rounded-full px-4 py-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-48 relative z-10">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    {/* Poster */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-shrink-0"
                    >
                        <div className="w-56 md:w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 mx-auto md:mx-0">
                            <img
                                src={movie.poster_url || fallbackPoster}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="flex-1 min-w-0"
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{movie.title}</h1>

                        <div className="flex flex-wrap items-center gap-4 mt-4">
                            {movie.release_year && (
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">{movie.release_year}</span>
                                </div>
                            )}
                            {movie.rating && (
                                <div className="flex items-center gap-1.5">
                                    <StarRating rating={Math.round(movie.rating)} readOnly size="sm" />
                                    <span className="text-amber-400 font-semibold text-sm">{movie.rating.toFixed(1)}</span>
                                </div>
                            )}
                            {movie.popularity_score && (
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm">Popularity: {movie.popularity_score}</span>
                                </div>
                            )}
                        </div>

                        {movie.genre?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-5">
                                {movie.genre.map((g) => (
                                    <GenrePill key={g} genre={g} size="sm" />
                                ))}
                            </div>
                        )}

                        <p className="text-zinc-300 leading-relaxed mt-6 text-base md:text-lg max-w-2xl">
                            {movie.description || "No description available."}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 mt-8">
                            <Button
                                onClick={handleToggleWatchlist}
                                variant={isInWatchlist ? "default" : "outline"}
                                className={`rounded-xl px-6 py-5 text-sm font-semibold transition-all ${
                                    isInWatchlist
                                        ? "bg-amber-500 hover:bg-amber-400 text-black"
                                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                }`}
                            >
                                {isInWatchlist ? (
                                    <BookmarkCheck className="w-4 h-4 mr-2" />
                                ) : (
                                    <Bookmark className="w-4 h-4 mr-2" />
                                )}
                                {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                            </Button>
                        </div>

                        {/* Rating */}
                        <div className="mt-10 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                            <h3 className="text-white font-semibold text-lg mb-3">Rate this Movie</h3>
                            <p className="text-zinc-500 text-sm mb-4">
                                {userRating ? "You've rated this movie. Click to update." : "How would you rate this movie?"}
                            </p>
                            <StarRating
                                rating={userRating?.rating || 0}
                                onRate={handleRate}
                                size="lg"
                            />
                            {rateMutation.isPending && (
                                <p className="text-zinc-500 text-sm mt-2 flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Saving...
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="h-20" />
        </div>
    );
}