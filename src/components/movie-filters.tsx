"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, RotateCcw, Calendar, Building, Globe } from "lucide-react";
import { CinemaItem } from "@/types";

interface MovieFiltersProps {
  cinemas: CinemaItem[];
  genres: string[];
  languages: string[];
}

export default function MovieFilters({ cinemas, genres, languages }: MovieFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "all");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get("language") || "all");
  const [selectedCinema, setSelectedCinema] = useState(searchParams.get("cinema") || "all");
  const [selectedDate, setSelectedDate] = useState(searchParams.get("date") || "all");

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "all" || !v) {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedGenre("all");
    setSelectedLanguage("all");
    setSelectedCinema("all");
    setSelectedDate("all");
    startTransition(() => {
      router.push("/");
    });
  };

  // Generate next 7 dates
  const nextDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return { dateStr, label };
  });

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md mb-8">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              applyFilters({ query: e.target.value });
            }}
            placeholder="Search movies by title, director, cast, or genre..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-colors"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                applyFilters({ query: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Genre Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                applyFilters({ genre: e.target.value });
              }}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-rose-400" />
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                applyFilters({ language: e.target.value });
              }}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Cinema Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              Cinema / Theater
            </label>
            <select
              value={selectedCinema}
              onChange={(e) => {
                setSelectedCinema(e.target.value);
                applyFilters({ cinema: e.target.value });
              }}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer truncate"
            >
              <option value="all">All Cinemas</option>
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                applyFilters({ date: e.target.value });
              }}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Any Date</option>
              {nextDates.map((item) => (
                <option key={item.dateStr} value={item.dateStr}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status bar & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-xs">
          <span className="text-zinc-500">
            {isPending ? "Updating movies..." : "Showing active listings"}
          </span>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        </div>
      </div>
    </div>
  );
}
