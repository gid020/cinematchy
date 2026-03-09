import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "../components/movies/HeroSection";
import MovieGrid from "../components/movies/MovieGrid";
import SectionHeader from "../components/movies/SectionHeader";
import { Loader2 } from "lucide-react";

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState(null);
    const [watchlistIds, setWatchlistIds] = useState([]);

    useEffect(() => {
        base44.auth.me().then((u) => {
            setUser(u);
            base44.entities.Watchlist.filter({ user_id: u.id }).then((wl) => {
                setWatchlistIds(wl.map((w) => w.movie_id));
            });
        }).catch(() => {});
    }, []);

    const { data: movies = [], isLoading } = useQuery({
        queryKey: ["movies"],
        queryFn: () => base44.entities.Movies.list("-popularity_score", 50),
    });

    const filteredMovies = useMemo(() => {
        if (!searchQuery.trim()) return movies;
        const q = searchQuery.toLowerCase();
        return movies.filter((m) =>
            m.title?.toLowerCase().includes(q)
        );
    }, [movies, searchQuery]);

    const trendingMovies = useMemo(() => {
        return [...movies].sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0)).slice(0, 10);
    }, [movies]);

    const handleToggleWatchlist = async (movieId) => {
        if (!user) {
            base44.auth.redirectToLogin();
            return;
        }
        if (watchlistIds.includes(movieId)) {
            const items = await base44.entities.Watchlist.filter({ user_id: user.id, movie_id: movieId });
            if (items.length > 0) {
                await base44.entities.Watchlist.delete(items[0].id);
            }
            setWatchlistIds((prev) => prev.filter((id) => id !== movieId));
        } else {
            await base44.entities.Watchlist.create({ user_id: user.id, movie_id: movieId });
            setWatchlistIds((prev) => [...prev, movieId]);
        }
    };

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="bg-zinc-950 min-h-screen">
            <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                ) : isSearching ? (
                    <div>
                        <SectionHeader
                            title={`Results for "${searchQuery}"`}
                            subtitle={`${filteredMovies.length} movies found`}
                        />
                        <MovieGrid
                            movies={filteredMovies}
                            watchlistIds={watchlistIds}
                            onToggleWatchlist={handleToggleWatchlist}
                        />
                    </div>
                ) : (
                    <div>
                        <SectionHeader title="Trending Now" subtitle="Most popular movies right now" />
                        <MovieGrid
                            movies={trendingMovies}
                            watchlistIds={watchlistIds}
                            onToggleWatchlist={handleToggleWatchlist}
                        />

                        {movies.length > 10 && (
                            <div className="mt-16">
                                <SectionHeader title="All Movies" subtitle="Browse our full collection" />
                                <MovieGrid
                                    movies={movies}
                                    watchlistIds={watchlistIds}
                                    onToggleWatchlist={handleToggleWatchlist}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}