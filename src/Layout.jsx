import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Film, Home, LayoutDashboard, Bookmark, LogIn, LogOut, Menu, X, User } from "lucide-react";

export default function Layout({ children, currentPageName }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const navItems = [
        { name: "Home", page: "Home", icon: Home },
        ...(user ? [
            { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
            { name: "Watchlist", page: "Watchlist", icon: Bookmark },
            { name: "Profile", page: "Profile", icon: User },
        ] : []),
    ];

    return (
        <div className="min-h-screen bg-zinc-950">
            <style>{`
                body { background: #09090b; }
            `}</style>

            <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link to={createPageUrl("Home")} className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Film className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">CineMatch</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.page}
                                    to={createPageUrl(item.page)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        currentPageName === item.page
                                            ? "bg-zinc-800 text-white"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            {!loading && (
                                user ? (
                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-xs">
                                                {user.full_name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <span className="text-zinc-300 text-sm">{user.full_name}</span>
                                        </div>
                                        <button
                                            onClick={() => base44.auth.logout()}
                                            className="text-zinc-500 hover:text-white transition-colors p-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => base44.auth.redirectToLogin(window.location.href)}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Sign In
                                    </button>
                                )
                            )}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden text-zinc-400 hover:text-white p-2"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-xl">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.page}
                                    to={createPageUrl(item.page)}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                                        currentPageName === item.page
                                            ? "bg-zinc-800 text-white"
                                            : "text-zinc-400"
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            <main className="pt-16">
                {children}
            </main>
        </div>
    );
}