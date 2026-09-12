import { getShowtimeById, getSeatsForShowtime } from "@/lib/data-store";
import { notFound } from "next/navigation";
import SeatMap from "@/components/seat-map";
import Link from "next/link";
import { ArrowLeft, Film, Clock, Calendar, MapPin } from "lucide-react";
import { formatShowDate, formatShowTime } from "@/lib/utils";

interface BookingPageProps {
  params: Promise<{ showtimeId: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { showtimeId } = await params;
  const showtime = await getShowtimeById(showtimeId);

  if (!showtime) {
    notFound();
  }

  const seats = await getSeatsForShowtime(showtimeId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Movies
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {showtime.movieTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
              {showtime.experienceFormat}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 bg-zinc-900/80 px-4 py-2.5 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{showtime.cinemaName}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatShowDate(showtime.startTime)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white">{formatShowTime(showtime.startTime)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Seat Selection Component */}
      <SeatMap showtime={showtime} initialSeats={seats} />
    </div>
  );
}
