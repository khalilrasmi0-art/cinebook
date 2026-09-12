"use client";

import { BookingItem } from "@/types";
import { formatCurrency, formatShowDate, formatShowTime } from "@/lib/utils";
import { Film, Calendar, Clock, MapPin, CheckCircle, Printer, Download, Share2 } from "lucide-react";

interface TicketPassProps {
  booking: BookingItem;
}

export default function TicketPass({ booking }: TicketPassProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
      {/* Action buttons */}
      <div className="w-full flex items-center justify-between mb-4 print:hidden">
        <span className="text-xs text-zinc-400">Digital Admission Pass</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Ticket
          </button>
        </div>
      </div>

      {/* Main Ticket Pass Card */}
      <div className="w-full rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl relative">
        {/* Ticket Header Banner */}
        <div className="relative h-32 bg-zinc-900 overflow-hidden">
          {booking.moviePoster && (
            <img
              src={booking.moviePoster}
              alt={booking.movieTitle || "Movie"}
              className="w-full h-full object-cover blur-sm opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>

          <div className="absolute top-4 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center">
                <Film className="w-4 h-4 text-zinc-950 font-bold stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Cine<span className="text-amber-400">Book</span> Pass
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle className="w-3 h-3" />
              <span>{booking.status}</span>
            </div>
          </div>

          <div className="absolute bottom-3 left-6 right-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-0.5">
              Booking Ref
            </span>
            <span className="font-mono text-xl font-extrabold text-white tracking-wider">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        {/* Perforation Cutout Left and Right */}
        <div className="relative border-t-2 border-dashed border-zinc-800 py-6 px-6 sm:px-8">
          <div className="absolute -left-4 -top-4 w-8 h-8 rounded-full bg-zinc-950 border-r border-zinc-800"></div>
          <div className="absolute -right-4 -top-4 w-8 h-8 rounded-full bg-zinc-950 border-l border-zinc-800"></div>

          {/* Movie Details */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white leading-tight mb-1">
              {booking.movieTitle}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{booking.cinemaName} • {booking.screenName}</span>
            </div>
          </div>

          {/* Showtime Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-6">
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-0.5">Date</span>
              <span className="text-xs font-bold text-white">
                {booking.startTime ? formatShowDate(booking.startTime) : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-0.5">Time</span>
              <span className="text-xs font-bold text-amber-400">
                {booking.startTime ? formatShowTime(booking.startTime) : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-0.5">Seats</span>
              <span className="text-xs font-bold text-white">
                {booking.seats?.map((s) => s.seatLabel).join(", ") || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-0.5">Total Paid</span>
              <span className="text-xs font-bold text-emerald-400">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
          </div>

          {/* QR Code & Scan Instructions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/60">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <span className="text-xs font-bold text-white mb-1">Scan at Turnstile / Usher</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs">
                Present this digital QR code or mention reference <strong className="text-amber-400">{booking.bookingReference}</strong> at entrance.
              </p>
              <div className="mt-3 text-[10px] text-zinc-500">
                Guest: <strong className="text-zinc-300">{booking.customerName}</strong> ({booking.customerEmail})
              </div>
            </div>

            {/* QR Code Image */}
            <div className="bg-white p-2 rounded-2xl shadow-xl shrink-0">
              {booking.qrCodeData ? (
                <img
                  src={booking.qrCodeData}
                  alt={`QR code for ${booking.bookingReference}`}
                  className="w-32 h-32"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center text-xs text-zinc-400 font-mono">
                  QR READY
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Footer barcode accent */}
        <div className="bg-zinc-950 border-t border-zinc-800/60 py-3 px-6 text-center text-[10px] text-zinc-500 uppercase tracking-wider">
          Issued by CineBook Engine • Valid for specified date & time only
        </div>
      </div>
    </div>
  );
}
