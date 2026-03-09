import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import MovieGrid from "../components/movies/MovieGrid";
import SectionHeader from "../components/movies/SectionHeader";
import GenrePill from "../components/movies/GenrePill";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const ALL_GENRES = ["Action", "Comedy", "Drama", "Sci-Fi", "Romance", "Thriller"];

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [watchlistIds, setWatchlistIds] = useState([]);

    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {}).finally(() => setAuthChecked(true));
    }, []);

    const { data: movies = [], isLoading: moviesLoading } = useQuery({
        queryKey: ["all-movies"],
        queryFn: () => base44.entities.Movies.list("-popularity_score", 100),
    });

    const { data: userRatings = [], isLoading: ratingsLoading } = useQuery({
        queryKey: ["user-ratings", user?.id],
        queryFn: () => base44.entities.Ratings.filter({ user_id: user.id }),
        enabled: !!user,
    });

    const { data: watchlistItems = [] } = useQuery({
        queryKey: ["user-watchlist", user?.id],
        queryFn: async () => {
            const wl = await base44.entities.Watchlist.filter({ user_id: user.id });
            setWatchlistIds(wl.map((w) => w.movie_id));
            return wl;
        },
        enabled: !!user,
    });

    const { recommendations, recommendationMessage } = useMemo(() => {
        if (!userRatings.length || !movies.length) {
            return { recommendations: [], recommendationMessage: "Trending movies for new users" };
        }

        const ratedMovieIds = new Set(userRatings.map((r) => r.movie_id));

        // Weight genres by star rating (rating >= 4)
        const genreScores = {};
        userRatings.forEach((r) => {
            if (r.rating >= 4) {
                const movie = movies.find((m) => m.id === r.movie_id);
                movie?.genre?.forEach((g) => {
                    genreScores[g] = (genreScores[g] || 0) + r.rating;
                });
            }
        });

        // Cold start fallback: use all rated movies if no high-rated ones
        if (Object.keys(genreScores).length === 0) {
            userRatings.forEach((r) => {
                const movie = movies.find((m) => m.id === r.movie_id);
                movie?.genre?.forEach((g) => {
                    genreScores[g] = (genreScores[g] || 0) + r.rating;
                });
            });
        }

        const favoriteGenres = Object.entries(genreScores)
            .sort((a, b) => b[1] - a[1])
            .map(([genre]) => genre);

        const topGenre = favoriteGenres[0];
        const message = topGenre
            ? `Based on your interest in ${topGenre} movies`
            : "Trending movies for new users";

        const recs = movies
            .filter((m) => !ratedMovieIds.has(m.id))
            .filter((m) => m.genre?.some((g) => favoriteGenres.includes(g)))
            .sort((a, b) => {
                const aMatch = a.genre?.filter((g) => favoriteGenres.includes(g)).length || 0;
                const bMatch = b.genre?.filter((g) => favoriteGenres.includes(g)).length || 0;
                if (bMatch !== aMatch) return bMatch - aMatch;
                const ratingDiff = (b.rating || 0) - (a.rating || 0);
                if (ratingDiff !== 0) return ratingDiff;
                return (b.popularity_score || 0) - (a.popularity_score || 0);
            })
            .slice(0, 10);

        return { recommendations: recs, recommendationMessage: message };
    }, [userRatings, movies]);

    const trendingMovies = useMemo(() => {
        return [...movies].sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0)).slice(0, 10);
    }, [movies]);

    const genreMovies = useMemo(() => {
        if (!selectedGenre) return [];
        return movies.filter((m) => m.genre?.includes(selectedGenre));
    }, [movies, selectedGenre]);

    const handleToggleWatchlist = async (movieId) => {
        if (!user) return;
        if (watchlistIds.includes(movieId)) {
            const items = await base44.entities.Watchlist.filter({ user_id: user.id, movie_id: movieId });
            if (items.length > 0) await base44.entities.Watchlist.delete(items[0].id);
            setWatchlistIds((prev) => prev.filter((id) => id !== movieId));
        } else {
            await base44.entities.Watchlist.create({ user_id: user.id, movie_id: movieId });
            setWatchlistIds((prev) => [...prev, movieId]);
        }
    };

    const isLoading = moviesLoading || ratingsLoading;

    if (!user && authChecked) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-screen bg-zinc-950 overflow-hidden">
                {/* Background decorative blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg"
                >
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/30">
                        <Sparkles className="w-9 h-9 text-black" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Your Personal Cinema
                    </h1>
                    <p className="text-zinc-400 text-lg mb-2">
                        Sign in to unlock your personalized dashboard.
                    </p>
                    <p className="text-zinc-600 text-sm mb-10">
                        Get tailored recommendations, track your watchlist, and discover movies you'll love.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {["✨ Personalized Picks", "🎬 Trending Movies", "📌 Watchlist", "⭐ Rate & Review"].map((f) => (
                            <span key={f} className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 text-sm">
                                {f}
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={() => base44.auth.redirectToLogin(window.location.href)}
                        className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-xl text-base transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
                    >
                        Sign In to Get Started
                    </button>
                </motion.div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-950">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                {/* Welcome */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
                    </h1>
                    <p className="text-zinc-500 mt-2">Here's what we've picked for you today</p>
                </div>

                {/* Recommended For You */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-black" />
                        </div>
                        <SectionHeader
                            title="Recommended For You"
                            subtitle={recommendationMessage}
                        />
                    </div>
                    <MovieGrid
                        movies={recommendations.length > 0 ? recommendations : trendingMovies}
                        watchlistIds={watchlistIds}
                        onToggleWatchlist={handleToggleWatchlist}
                    />
                </section>

                {/* Trending */}
                <section className="mb-16">
                    <SectionHeader title="Trending Movies" subtitle="What everyone's watching" />
                    <MovieGrid
                        movies={trendingMovies}
                        watchlistIds={watchlistIds}
                        onToggleWatchlist={handleToggleWatchlist}
                    />
                </section>

                {/* Browse by Genre */}
                <section>
                    <SectionHeader title="Browse by Genre" subtitle="Find movies in your favorite category" />
                    <div className="flex flex-wrap gap-3 mb-8">
                        {ALL_GENRES.map((genre) => (
                            <GenrePill
                                key={genre}
                                genre={genre}
                                selected={selectedGenre === genre}
                                onClick={(g) => setSelectedGenre(selectedGenre === g ? null : g)}
                            />
                        ))}
                    </div>
                    {selectedGenre && (
                        <MovieGrid
                            movies={genreMovies}
                            watchlistIds={watchlistIds}
                            onToggleWatchlist={handleToggleWatchlist}
                        />
                    )}
                    {!selectedGenre && (
                        <p className="text-zinc-600 text-center py-8">Select a genre to browse movies</p>
                    )}
                </section>
            </div>
        </div>
    );
}