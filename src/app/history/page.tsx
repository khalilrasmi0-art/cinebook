"use client";

import { useEffect, useState } from "react";
import { BookingItem } from "@/types";
import { formatCurrency, formatShowDate, formatShowTime } from "@/lib/utils";
import Link from "next/link";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function HistoryPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking? Your seats will be immediately made available for others and a full refund will be processed."
    );
    if (!confirmCancel) return;

    setCancellingId(bookingId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ text: data.message, type: "success" });
        await fetchBookings();
      } else {
        setActionMessage({ text: data.error || "Failed to cancel booking.", type: "error" });
      }
    } catch (err) {
      setActionMessage({ text: "Network error trying to cancel booking.", type: "error" });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
            Customer Portal
          </span>
          <h1 className="text-3xl font-extrabold text-white">My Booking History</h1>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 font-bold text-xs shadow-md hover:opacity-95 transition-opacity"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Book Another Movie
        </Link>
      </div>

      {actionMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-2.5 text-xs ${
            actionMessage.type === "success"
              ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
              : "bg-rose-950/40 border border-rose-800/60 text-rose-300"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-500 text-sm">
          Loading your tickets...
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No bookings yet</h3>
          <p className="text-xs text-zinc-400 mb-6">
            You haven't reserved any tickets yet. Explore movies and choose your seats!
          </p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 text-xs font-bold rounded-xl"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === "confirmed";
            const isCancelled = booking.status === "cancelled";

            return (
              <div
                key={booking.id}
                className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 sm:p-6 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  {booking.moviePoster && (
                    <img
                      src={booking.moviePoster}
                      alt={booking.movieTitle || "Movie"}
                      className="w-16 h-24 object-cover rounded-xl border border-zinc-800 shrink-0"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-extrabold text-amber-400">
                        {booking.bookingReference}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isConfirmed
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">
                      {booking.movieTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {booking.cinemaName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {booking.startTime ? formatShowDate(booking.startTime) : "N/A"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {booking.startTime ? formatShowTime(booking.startTime) : "N/A"}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-zinc-400">
                      Seats:{" "}
                      <strong className="text-zinc-200">
                        {booking.seats?.map((s) => s.seatLabel).join(", ") || "Standard"}
                      </strong>{" "}
                      • Total:{" "}
                      <strong className="text-amber-400 font-mono">
                        {formatCurrency(booking.totalAmount)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                  <Link
                    href={`/ticket/${booking.bookingReference}`}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5 text-amber-400" />
                    View Pass & QR
                  </Link>

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
