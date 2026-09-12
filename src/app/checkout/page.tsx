"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Sparkles,
  AlertCircle,
  Film,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";

interface StoredCheckoutData {
  showtimeId: string;
  seatIds: string[];
  selectedSeats: { id: string; label: string; seatType: string; price: string }[];
  subtotal: number;
  bookingFee: number;
  tax: number;
  total: number;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showtimeId = searchParams.get("showtimeId");

  const [checkoutData, setCheckoutData] = useState<StoredCheckoutData | null>(null);
  const [customerName, setCustomerName] = useState("Alex Johnson");
  const [customerEmail, setCustomerEmail] = useState("alex@cinebook.com");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("982");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!showtimeId) {
      router.push("/");
      return;
    }

    const stored = sessionStorage.getItem(`cinebook_checkout_${showtimeId}`);
    if (stored) {
      try {
        setCheckoutData(JSON.parse(stored));
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }

    // Prefill logged in user if available
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCustomerName(data.user.name);
          setCustomerEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, [showtimeId, router]);

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 text-sm">Loading checkout session...</p>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage("Please provide both name and a valid email address.");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: checkoutData.showtimeId,
          customerName,
          customerEmail,
          seatIds: checkoutData.seatIds,
          paymentIntentId: `pi_test_${Date.now()}_stripe_success`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Payment and booking failed.");
        setIsProcessing(false);
        return;
      }

      // Cleanup session state
      sessionStorage.removeItem(`cinebook_checkout_${checkoutData.showtimeId}`);

      // Navigate to digital ticket page
      router.push(`/ticket/${data.booking.bookingReference}`);
    } catch {
      setErrorMessage("Network error processing payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
          Secure Payment
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Review & Complete Reservation
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Payment Form (7 cols) */}
        <div className="md:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">Payment Method</h2>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
              <Lock className="w-3 h-3" />
              <span>Stripe Test Mode</span>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Full Name on Ticket
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Email for Ticket Delivery
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Test Card Inputs */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Card Details (Test Simulation)
              </label>
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="bg-transparent text-sm text-white font-mono w-full focus:outline-none"
                  />
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">
                    TEST
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900 text-xs">
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="bg-transparent text-white font-mono focus:outline-none"
                  />
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="CVC"
                    className="bg-transparent text-right text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Stripe test mode is active. No real credit card will be charged.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isProcessing
                ? "Securing Seats & Issuing Pass..."
                : `Pay & Confirm ${formatCurrency(checkoutData.total)}`}
            </button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-bit encrypted test transaction • Instant QR delivery</span>
            </div>
          </form>
        </div>

        {/* Order Summary (5 cols) */}
        <div className="md:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-xl">
          <h3 className="font-bold text-white text-base pb-3 border-b border-zinc-800 mb-4">
            Ticket Overview
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Total Seats</span>
              <span className="text-white font-bold">{checkoutData.seatIds.length}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {checkoutData.selectedSeats.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-bold text-amber-400"
                >
                  {s.label} (${s.price})
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 py-4 border-t border-b border-zinc-800 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Tickets Subtotal</span>
              <span className="text-zinc-200">{formatCurrency(checkoutData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Online Booking Fee</span>
              <span className="text-zinc-200">{formatCurrency(checkoutData.bookingFee)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Sales Tax (8.875%)</span>
              <span className="text-zinc-200">{formatCurrency(checkoutData.tax)}</span>
            </div>
            <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
              <span className="font-bold text-white text-sm">Amount Due</span>
              <span className="text-xl font-extrabold text-amber-400">
                {formatCurrency(checkoutData.total)}
              </span>
            </div>
          </div>

          <div className="pt-4 text-xs text-zinc-400 space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full refund available up to 2 hours before show</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital pass with QR scannable immediately</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-zinc-400 text-sm">Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
