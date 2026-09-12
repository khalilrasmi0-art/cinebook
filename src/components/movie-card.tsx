import Link from "next/link";
import { MovieItem } from "@/types";
import { Star, Clock, Ticket, Calendar } from "lucide-react";

interface MovieCardProps {
  movie: MovieItem;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden hover:border-zinc-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/20 hover:-translate-y-1">
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-zinc-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {movie.ratingScore}
          </span>
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-zinc-950/80 backdrop-blur-md text-zinc-300 border border-zinc-700/50">
            {movie.mpaaRating}
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-rose-600/90 backdrop-blur-md text-white shadow-sm">
            {movie.language}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <p className="text-xs text-zinc-300 line-clamp-3 mb-3 font-normal">
            {movie.synopsis}
          </p>
          <Link
            href={`/movies/${movie.slug}`}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg hover:opacity-95"
          >
            <Ticket className="w-3.5 h-3.5" />
            Book Tickets
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-medium text-amber-500 uppercase tracking-wider block mb-1">
            {movie.genre}
          </span>
          <h3 className="font-bold text-white text-base leading-tight group-hover:text-amber-400 transition-colors line-clamp-1">
            {movie.title}
          </h3>
        </div>

        <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            {movie.durationMinutes}m
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            {movie.releaseDate}
          </span>
        </div>
      </div>
    </div>
  );
}
