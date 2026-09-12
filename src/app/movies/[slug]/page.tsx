import { getMovieBySlug, getShowtimesForMovie, getMovies } from "@/lib/data-store";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Star,
  Film,
  Building,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { formatShowDate, formatShowTime, formatCurrency } from "@/lib/utils";

interface MovieDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const movies = await getMovies();
  return movies.map((m) => ({
    slug: m.slug,
  }));
}

export default async function MovieDetailsPage({ params }: MovieDetailsPageProps) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  const showtimes = await getShowtimesForMovie(movie.id);

  // Group showtimes by date
  const groupedByDate: Record<string, typeof showtimes> = {};
  showtimes.forEach((st) => {
    const dateKey = st.startTime.split("T")[0];
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(st);
  });

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="min-h-screen pb-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-[400px] sm:h-[480px] overflow-hidden">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Movies
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-20">
        {/* Movie Info Card */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Poster column */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 aspect-[2/3] max-w-[280px] mx-auto md:mx-0">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info details column */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between h-full space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    {movie.genre}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-medium">
                    {movie.language}
                  </span>
                  <span className="px-2.5 py-0.5 rounded border border-zinc-700 text-zinc-300 text-xs font-medium">
                    {movie.mpaaRating}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-zinc-950 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {movie.ratingScore} / 10
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {movie.title}
                </h1>

                <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {movie.durationMinutes} mins
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    Release: {movie.releaseDate}
                  </span>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 mb-2">
                  Synopsis
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
                  {movie.synopsis}
                </p>
              </div>

              {/* Cast and Director */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80 text-xs">
                <div>
                  <span className="text-zinc-500 font-semibold block mb-0.5">Director</span>
                  <span className="text-zinc-200 font-medium">{movie.director}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-semibold block mb-0.5">Starring Cast</span>
                  <span className="text-zinc-200 font-medium">{movie.castMembers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Showtimes & Seat Booking Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Film className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Select Showtime & Experience
            </h2>
          </div>

          {sortedDates.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
              <p className="text-zinc-400 text-sm">No active showtimes scheduled for this movie currently.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateKey) => {
                const dayShowtimes = groupedByDate[dateKey];
                return (
                  <div
                    key={dateKey}
                    className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800 text-sm font-bold text-amber-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatShowDate(dateKey)}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayShowtimes.map((st) => (
                        <div
                          key={st.id}
                          className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/60 transition-colors group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                                {st.experienceFormat}
                              </span>
                              <span className="text-xs font-bold text-emerald-400">
                                From {formatCurrency(st.priceStandard)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                              <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span className="line-clamp-1">{st.cinemaName}</span>
                            </div>

                            <div className="text-[11px] text-zinc-500 mb-3">
                              {st.screenName}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
                            <span className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">
                              {formatShowTime(st.startTime)}
                            </span>

                            <Link
                              href={`/booking/${st.id}`}
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 text-xs font-bold flex items-center gap-1 shadow-md hover:opacity-95"
                            >
                              <Sparkles className="w-3 h-3" />
                              Select Seats
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
