import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import MovieGrid from "../components/movies/MovieGrid";
import SectionHeader from "../components/movies/SectionHeader";
import { Loader2, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

export default function Watchlist() {
    const [user, setUser] = useState(null);

    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {}).finally(() => setAuthChecked(true));
    }, []);

    const { data: watchlistItems = [], isLoading: wlLoading, refetch } = useQuery({
        queryKey: ["watchlist", user?.id],
        queryFn: () => base44.entities.Watchlist.filter({ user_id: user.id }),
        enabled: !!user,
    });

    const { data: allMovies = [], isLoading: moviesLoading } = useQuery({
        queryKey: ["all-movies-wl"],
        queryFn: () => base44.entities.Movies.list("-popularity_score", 200),
    });

    const watchlistMovies = useMemo(() => {
        const ids = new Set(watchlistItems.map((w) => w.movie_id));
        return allMovies.filter((m) => ids.has(m.id));
    }, [watchlistItems, allMovies]);

    const watchlistIds = watchlistItems.map((w) => w.movie_id);

    const handleToggleWatchlist = async (movieId) => {
        if (!user) return;
        const items = await base44.entities.Watchlist.filter({ user_id: user.id, movie_id: movieId });
        if (items.length > 0) {
            await base44.entities.Watchlist.delete(items[0].id);
        }
        refetch();
    };

    const isLoading = wlLoading || moviesLoading;

    if (!user && authChecked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-4">
                <h2 className="text-2xl font-bold text-white">Sign in to view your Watchlist</h2>
                <button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-semibold transition-colors"
                >
                    Sign In
                </button>
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
                <SectionHeader
                    title="My Watchlist"
                    subtitle={`${watchlistMovies.length} movies saved`}
                />

                {watchlistMovies.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32"
                    >
                        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                            <Bookmark className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-400">Your watchlist is empty</h3>
                        <p className="text-zinc-600 mt-2 text-center max-w-sm">
                            Browse movies and click the + button to save them here for later
                        </p>
                    </motion.div>
                ) : (
                    <MovieGrid
                        movies={watchlistMovies}
                        watchlistIds={watchlistIds}
                        onToggleWatchlist={handleToggleWatchlist}
                    />
                )}
            </div>
        </div>
    );
}