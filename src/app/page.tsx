import { getMovies, getCinemas } from "@/lib/data-store";
import MovieCard from "@/components/movie-card";
import MovieFilters from "@/components/movie-filters";
import Link from "next/link";
import { Sparkles, Film, Flame, Compass, ChevronRight } from "lucide-react";

interface HomePageProps {
  searchParams: Promise<{
    query?: string;
    genre?: string;
    language?: string;
    cinema?: string;
    date?: string;
  }>;
}

export default async function HomePage(props: HomePageProps) {
  const searchParams = await props.searchParams;
  const cinemas = await getCinemas();

  const movies = await getMovies({
    query: searchParams.query,
    genre: searchParams.genre,
    language: searchParams.language,
    cinemaId: searchParams.cinema,
    date: searchParams.date,
  });

  const featuredMovie = movies.length > 0 ? movies[0] : null;

  // Extract unique genres and languages for filter lists
  const allMovies = await getMovies();
  const genres = Array.from(new Set(allMovies.flatMap((m) => m.genre.split(" / ")))).sort();
  const languages = Array.from(new Set(allMovies.map((m) => m.language))).sort();

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Featured Banner (if first movie exists and no query) */}
      {!searchParams.query && featuredMovie && (
        <section className="relative w-full h-[520px] sm:h-[620px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featuredMovie.backdropUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-16">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                Featured Premiere
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
                {featuredMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold">
                  ★ {featuredMovie.ratingScore}
                </span>
                <span>{featuredMovie.genre}</span>
                <span>•</span>
                <span>{featuredMovie.durationMinutes} Minutes</span>
                <span>•</span>
                <span className="border border-zinc-700 px-1.5 py-0.2 rounded text-[11px]">
                  {featuredMovie.mpaaRating}
                </span>
              </div>

              <p className="text-zinc-300 text-sm sm:text-base line-clamp-3 leading-relaxed drop-shadow">
                {featuredMovie.synopsis}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={`/movies/${featuredMovie.slug}`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 font-extrabold text-sm flex items-center gap-2 hover:opacity-95 shadow-xl shadow-rose-950/50 transition-all hover:scale-102"
                >
                  <Sparkles className="w-4 h-4 fill-zinc-950" />
                  Book Tickets Now
                </Link>

                {featuredMovie.trailerUrl && (
                  <a
                    href={featuredMovie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-white font-medium text-sm transition-colors"
                  >
                    Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog & Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-500 flex items-center gap-1.5 mb-1">
              <Film className="w-4 h-4" />
              Now Playing & Available Showtimes
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore Cinema Screenings
            </h2>
          </div>
          <Link
            href="/cinemas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition-colors"
          >
            Browse all theaters <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Controls */}
        <MovieFilters cinemas={cinemas} genres={genres} languages={languages} />

        {/* Movie Results Grid */}
        {movies.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-12 text-center max-w-lg mx-auto">
            <Compass className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No movies found</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Try relaxing your search terms or filter selections.
            </p>
            <Link
              href="/"
              className="inline-flex px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
