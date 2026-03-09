import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import MovieGrid from "../components/movies/MovieGrid";
import SectionHeader from "../components/movies/SectionHeader";
import GenrePill from "../components/movies/GenrePill";
import { Loader2, Sparkles } from "lucide-react";

const ALL_GENRES = ["Action", "Comedy", "Drama", "Sci-Fi", "Romance", "Thriller"];

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [watchlistIds, setWatchlistIds] = useState([]);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {
            base44.auth.redirectToLogin();
        });
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

    const recommendations = useMemo(() => {
        if (!userRatings.length || !movies.length) return [];

        const ratedMovieIds = new Set(userRatings.map((r) => r.movie_id));
        
        // Find favorite genres from highly rated movies (rating >= 4)
        const genreScores = {};
        userRatings.forEach((r) => {
            if (r.rating >= 4) {
                const movie = movies.find((m) => m.id === r.movie_id);
                movie?.genre?.forEach((g) => {
                    genreScores[g] = (genreScores[g] || 0) + r.rating;
                });
            }
        });

        // If no high-rated movies, use all rated movies
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

        return movies
            .filter((m) => !ratedMovieIds.has(m.id))
            .filter((m) => m.genre?.some((g) => favoriteGenres.includes(g)))
            .sort((a, b) => {
                const aGenreMatch = a.genre?.filter((g) => favoriteGenres.includes(g)).length || 0;
                const bGenreMatch = b.genre?.filter((g) => favoriteGenres.includes(g)).length || 0;
                if (bGenreMatch !== aGenreMatch) return bGenreMatch - aGenreMatch;
                const ratingDiff = (b.rating || 0) - (a.rating || 0);
                if (ratingDiff !== 0) return ratingDiff;
                return (b.popularity_score || 0) - (a.popularity_score || 0);
            })
            .slice(0, 10);
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
                            subtitle={userRatings.length > 0 ? "Based on your ratings" : "Rate some movies to get personalized picks"}
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