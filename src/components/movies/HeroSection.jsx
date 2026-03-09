import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function HeroSection({ searchQuery, onSearchChange }) {
    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-zinc-950 to-zinc-950" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute top-20 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                        Discover Your Next
                        <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Favorite Film
                        </span>
                    </h1>
                    <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
                        Personalized recommendations based on your taste
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-10 max-w-2xl mx-auto"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search movies by title..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all text-lg"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}