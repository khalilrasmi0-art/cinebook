"use client";

import { useEffect, useState } from "react";
import { MovieItem, BookingItem, UserSession } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  ShieldAlert,
  PlusCircle,
  Film,
  Ticket,
  DollarSign,
  TrendingUp,
  Lock,
} from "lucide-react";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // New movie form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [director, setDirector] = useState("");
  const [castMembers, setCastMembers] = useState("");
  const [genre, setGenre] = useState("Action / Sci-Fi");
  const [language, setLanguage] = useState("English");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [posterUrl, setPosterUrl] = useState(
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
  );
  const [backdropUrl, setBackdropUrl] = useState(
    "https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1600&q=80"
  );
  const [releaseDate, setReleaseDate] = useState("2025-02-01");
  const [ratingScore, setRatingScore] = useState("8.0");

  const loadData = async () => {
    try {
      const resUser = await fetch("/api/auth/me");
      const userData = await resUser.json();
      setCurrentUser(userData.user);
      setAuthChecked(true);

      if (userData.user && userData.user.role === "admin") {
        const resBookings = await fetch("/api/bookings");
        const dataBookings = await resBookings.json();
        if (dataBookings.bookings) setBookings(dataBookings.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (authChecked && (!currentUser || currentUser.role !== "admin")) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Admin Access Required</h1>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed max-w-sm">
          You must be logged into an authorized Administrator account to view cinema analytics, publish films, or audit bookings.
        </p>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 font-bold text-xs shadow-lg"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const totalRevenue = bookings.reduce((sum, b) => {
    if (b.status === "confirmed") {
      return sum + parseFloat(b.totalAmount);
    }
    return sum;
  }, 0);

  const totalTicketsSold = bookings.reduce((sum, b) => {
    if (b.status === "confirmed") {
      return sum + (b.seats?.length || 1);
    }
    return sum;
  }, 0);

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          synopsis,
          director,
          castMembers,
          genre,
          language,
          durationMinutes: Number(durationMinutes),
          mpaaRating: "PG-13",
          posterUrl,
          backdropUrl,
          releaseDate,
          ratingScore,
          isNowShowing: true,
        }),
      });

      if (res.ok) {
        alert("Movie added successfully!");
        setShowAddForm(false);
        window.location.reload();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to add movie");
      }
    } catch {
      alert("Error adding movie");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400 flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4" />
            Admin Operations Panel
          </span>
          <h1 className="text-3xl font-extrabold text-white">Cinema Dashboard</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-lg cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          {showAddForm ? "Close Form" : "Add New Movie"}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Total Revenue</span>
            <span className="text-2xl font-black text-white">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Tickets Booked</span>
            <span className="text-2xl font-black text-white">{totalTicketsSold}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Active Bookings</span>
            <span className="text-2xl font-black text-white">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* Add Movie Form */}
      {showAddForm && (
        <div className="mb-10 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" /> Add New Cinema Title
          </h2>
          <form onSubmit={handleAddMovie} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Movie Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. blade-runner-2099"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Synopsis</label>
              <textarea
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                required
                rows={3}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Director</label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Cast Members</label>
              <input
                type="text"
                value={castMembers}
                onChange={(e) => setCastMembers(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Poster URL</label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Publish Movie & Generate Showtimes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings Ledger */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-amber-400" /> Recent Booking Transactions
        </h2>

        {bookings.length === 0 ? (
          <p className="text-zinc-500 text-xs py-4">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-2">Ref</th>
                  <th className="py-3 px-2">Movie</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Seats</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3 px-2 font-mono text-amber-400 font-bold">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 px-2 text-white font-medium">{b.movieTitle}</td>
                    <td className="py-3 px-2">
                      {b.customerName} ({b.customerEmail})
                    </td>
                    <td className="py-3 px-2 font-semibold">
                      {b.seats?.map((s) => s.seatLabel).join(", ") || "-"}
                    </td>
                    <td className="py-3 px-2 text-emerald-400 font-bold font-mono">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === "confirmed"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
