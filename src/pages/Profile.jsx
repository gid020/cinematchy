import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Star, Film, Edit2, Save, X, User, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StarRating from "../components/movies/StarRating";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        base44.auth.me().then((u) => {
            setUser(u);
            setFullName(u.full_name || "");
        }).catch(() => {}).finally(() => setAuthChecked(true));
    }, []);

    const { data: userRatings = [], isLoading: ratingsLoading } = useQuery({
        queryKey: ["profile-ratings", user?.id],
        queryFn: () => base44.entities.Ratings.filter({ user_id: user.id }, "-created_at", 50),
        enabled: !!user,
    });

    const { data: allMovies = [], isLoading: moviesLoading } = useQuery({
        queryKey: ["all-movies-profile"],
        queryFn: () => base44.entities.Movies.list("-popularity_score", 200),
        enabled: !!user,
    });

    const { data: watchlistItems = [] } = useQuery({
        queryKey: ["watchlist-count", user?.id],
        queryFn: () => base44.entities.Watchlist.filter({ user_id: user.id }),
        enabled: !!user,
    });

    const recentReviews = useMemo(() => {
        return userRatings
            .map((r) => ({
                ...r,
                movie: allMovies.find((m) => m.id === r.movie_id),
            }))
            .filter((r) => r.movie)
            .slice(0, 10);
    }, [userRatings, allMovies]);

    const avgRating = useMemo(() => {
        if (!userRatings.length) return 0;
        return userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
    }, [userRatings]);

    const handleSave = async () => {
        setSaving(true);
        await base44.auth.updateMe({ full_name: fullName });
        const updated = await base44.auth.me();
        setUser(updated);
        setEditing(false);
        setSaving(false);
    };

    if (!authChecked) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-950">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-4">
                <h2 className="text-2xl font-bold text-white">Sign in to view your Profile</h2>
                <button
                    onClick={() => base44.auth.redirectToLogin(window.location.href)}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-semibold transition-colors"
                >
                    Sign In
                </button>
            </div>
        );
    }

    const isLoading = ratingsLoading || moviesLoading;

    return (
        <div className="bg-zinc-950 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-3xl flex-shrink-0">
                            {user.full_name?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 w-full max-w-xs"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-semibold text-sm transition-colors"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save
                                    </button>
                                    <button
                                        onClick={() => { setEditing(false); setFullName(user.full_name || ""); }}
                                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{user.full_name || "Anonymous"}</h1>
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="p-1.5 text-zinc-600 hover:text-amber-400 transition-colors rounded-lg hover:bg-zinc-800"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <p className="text-zinc-500 mt-1">{user.email}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                >
                    {[
                        { label: "Movies Rated", value: userRatings.length, icon: Star, color: "from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-400" },
                        { label: "Avg. Rating", value: avgRating ? avgRating.toFixed(1) : "—", icon: Film, color: "from-purple-500/20 to-violet-500/20 border-purple-500/20 text-purple-400" },
                        { label: "Watchlist", value: watchlistItems.length, icon: Bookmark, color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/20 text-cyan-400" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-5 text-center`}
                        >
                            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color.split(" ").at(-1)}`} />
                            <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Recent Reviews */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xl font-bold text-white mb-5">Recent Reviews</h2>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                        </div>
                    ) : recentReviews.length === 0 ? (
                        <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                            <Star className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500">You haven't rated any movies yet.</p>
                            <Link
                                to={createPageUrl("Home")}
                                className="inline-block mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium"
                            >
                                Browse movies to rate →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentReviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.04 }}
                                >
                                    <Link to={createPageUrl("MovieDetails") + `?id=${review.movie_id}`}>
                                        <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all group">
                                            <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                                                <img
                                                    src={review.movie.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&h=150&fit=crop"}
                                                    alt={review.movie.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-semibold truncate">{review.movie.title}</h3>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {review.movie.genre?.map((g) => (
                                                        <span key={g} className="text-xs text-zinc-500 bg-zinc-800 rounded-full px-2 py-0.5">{g}</span>
                                                    ))}
                                                </div>
                                                {review.created_at && (
                                                    <p className="text-zinc-600 text-xs mt-2">{new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0">
                                                <StarRating rating={review.rating} readOnly size="sm" />
                                                <p className="text-amber-400 text-sm font-bold text-center mt-1">{review.rating}/5</p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}