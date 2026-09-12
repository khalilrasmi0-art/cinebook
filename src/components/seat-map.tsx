"use client";

import { useState } from "react";
import { SeatItem, ShowtimeItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Armchair, Check, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface SeatMapProps {
  showtime: ShowtimeItem;
  initialSeats: SeatItem[];
}

export default function SeatMap({ showtime, initialSeats }: SeatMapProps) {
  const router = useRouter();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Group seats by row
  const rowsMap = initialSeats.reduce((acc, seat) => {
    if (!acc[seat.rowLabel]) {
      acc[seat.rowLabel] = [];
    }
    acc[seat.rowLabel].push(seat);
    return acc;
  }, {} as Record<string, SeatItem[]>);

  // Sort rows alphabetically (A-H) and seats by number (1-10)
  const sortedRowLabels = Object.keys(rowsMap).sort();
  sortedRowLabels.forEach((row) => {
    rowsMap[row].sort((a, b) => a.seatNumber - b.seatNumber);
  });

  const toggleSeat = (seat: SeatItem) => {
    if (seat.isReserved) return;
    setErrorMessage("");

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMessage("Maximum 8 seats can be selected per booking.");
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  // Calculations
  const selectedSeats = initialSeats.filter((s) => selectedSeatIds.includes(s.id));
  const subtotal = selectedSeats.reduce((sum, seat) => {
    let price = parseFloat(showtime.priceStandard);
    if (seat.seatType === "vip") price = parseFloat(showtime.priceVip);
    if (seat.seatType === "accessible") price = parseFloat(showtime.priceAccessible);
    return sum + price;
  }, 0);

  const bookingFee = selectedSeats.length > 0 ? 2.5 : 0;
  const tax = selectedSeats.length > 0 ? subtotal * 0.08875 : 0;
  const total = subtotal + bookingFee + tax;

  const handleProceedToCheckout = () => {
    if (selectedSeatIds.length === 0) {
      setErrorMessage("Please select at least one seat to proceed.");
      return;
    }
    setIsSubmitting(true);
    // Store selected seat session in sessionStorage for smooth checkout handover
    sessionStorage.setItem(
      `cinebook_checkout_${showtime.id}`,
      JSON.stringify({
        showtimeId: showtime.id,
        seatIds: selectedSeatIds,
        selectedSeats: selectedSeats.map((s) => ({
          id: s.id,
          label: `${s.rowLabel}${s.seatNumber}`,
          seatType: s.seatType,
          price:
            s.seatType === "vip"
              ? showtime.priceVip
              : s.seatType === "accessible"
              ? showtime.priceAccessible
              : showtime.priceStandard,
        })),
        subtotal,
        bookingFee,
        tax,
        total,
      })
    );

    router.push(`/checkout?showtimeId=${showtime.id}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Seat Map View (8 cols) */}
      <div className="lg:col-span-8 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col items-center">
        {/* Cinema Curved Screen */}
        <div className="w-full max-w-xl flex flex-col items-center mb-10">
          <div className="w-full h-3 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full blur-[1px] opacity-80 mb-2"></div>
          <div className="w-full h-1 bg-gradient-to-r from-zinc-700 via-amber-300/40 to-zinc-700 rounded-full"></div>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500 mt-2">
            Screen This Way
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 text-xs text-zinc-400 bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-zinc-800 border border-zinc-700"></div>
            <span>Standard (${showtime.priceStandard})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50"></div>
            <span>VIP Recliner (${showtime.priceVip})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-sky-500/20 border border-sky-500/50"></div>
            <span>Accessible (${showtime.priceAccessible})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="text-white font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-zinc-800 opacity-30 cursor-not-allowed"></div>
            <span>Occupied</span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="w-full overflow-x-auto pb-4 flex justify-center">
          <div className="min-w-[500px] flex flex-col gap-2.5">
            {sortedRowLabels.map((rowLabel) => {
              const rowSeats = rowsMap[rowLabel];
              return (
                <div key={rowLabel} className="flex items-center gap-2 justify-center">
                  <span className="w-5 text-center font-bold text-xs text-zinc-500">
                    {rowLabel}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {rowSeats.map((seat, index) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isReserved = seat.isReserved;

                      // Add walkway space in middle
                      const isWalkway = index === 4;

                      let seatStyle =
                        "bg-zinc-800 border-zinc-700 hover:border-amber-400 hover:bg-zinc-700 text-zinc-300";

                      if (seat.seatType === "vip") {
                        seatStyle =
                          "bg-amber-950/40 border-amber-500/40 hover:bg-amber-900/60 hover:border-amber-400 text-amber-200";
                      } else if (seat.seatType === "accessible") {
                        seatStyle =
                          "bg-sky-950/40 border-sky-500/40 hover:bg-sky-900/60 hover:border-sky-400 text-sky-200";
                      }

                      if (isSelected) {
                        seatStyle =
                          "bg-gradient-to-br from-rose-600 to-amber-500 border-rose-400 text-white font-bold shadow-lg shadow-rose-900/50 scale-105";
                      }

                      if (isReserved) {
                        seatStyle =
                          "bg-zinc-900 border-zinc-800/40 text-zinc-700 opacity-25 cursor-not-allowed pointer-events-none";
                      }

                      return (
                        <div key={seat.id} className="flex items-center">
                          <button
                            type="button"
                            disabled={isReserved}
                            onClick={() => toggleSeat(seat)}
                            title={`${rowLabel}${seat.seatNumber} (${seat.seatType.toUpperCase()}) ${
                              isReserved ? "- Occupied" : ""
                            }`}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[10px] font-semibold flex items-center justify-center transition-all duration-150 relative ${seatStyle}`}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              seat.seatNumber
                            )}
                          </button>
                          {isWalkway && <div className="w-4 sm:w-6" />}
                        </div>
                      );
                    })}
                  </div>

                  <span className="w-5 text-center font-bold text-xs text-zinc-500">
                    {rowLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 text-rose-400 bg-rose-950/30 border border-rose-800/40 px-3.5 py-2 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Booking Summary Sidebar (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
              <Armchair className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Booking Summary</h3>
            </div>

            {/* Movie details */}
            <div className="py-4 border-b border-zinc-800 flex gap-3">
              {showtime.moviePoster && (
                <img
                  src={showtime.moviePoster}
                  alt={showtime.movieTitle}
                  className="w-16 h-22 object-cover rounded-xl border border-zinc-800"
                />
              )}
              <div className="flex flex-col justify-center">
                <h4 className="font-bold text-white text-sm line-clamp-1">
                  {showtime.movieTitle}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">{showtime.cinemaName}</p>
                <p className="text-xs text-amber-400/90 font-medium mt-1">
                  {showtime.screenName} • {showtime.experienceFormat}
                </p>
              </div>
            </div>

            {/* Selected Seats Chips */}
            <div className="py-4 border-b border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Selected Seats ({selectedSeats.length})
              </span>
              {selectedSeats.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No seats selected yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat.id}
                      className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                    >
                      {seat.rowLabel}
                      {seat.seatNumber}
                      <span className="text-[10px] text-zinc-400 font-normal">
                        ({seat.seatType})
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({selectedSeats.length} tickets)</span>
                <span className="text-zinc-200 font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Convenience / Booking Fee</span>
                <span className="text-zinc-200 font-medium">{formatCurrency(bookingFee)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Estimated Tax (8.875%)</span>
                <span className="text-zinc-200 font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Final Total</span>
                <span className="text-xl font-extrabold text-amber-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0 || isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? "Locking Seats..." : "Proceed to Checkout"}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seats are temporarily reserved upon checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
