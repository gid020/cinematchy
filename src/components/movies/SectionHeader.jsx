import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function SectionHeader({ title, subtitle, linkTo, linkText = "See all" }) {
    return (
        <div className="flex items-end justify-between mb-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
                {subtitle && <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>}
            </div>
            {linkTo && (
                <Link to={linkTo} className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
                    {linkText}
                    <ChevronRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    );
}