import { getBookingByReference } from "@/lib/data-store";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import TicketPass from "@/components/ticket-pass";
import Link from "next/link";
import { CheckCircle, ShieldAlert } from "lucide-react";

interface TicketPageProps {
  params: Promise<{ reference: string }>;
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { reference } = await params;
  const booking = await getBookingByReference(reference);

  if (!booking) {
    notFound();
  }

  // Authorization check: User must be the ticket owner or an admin (or guest creator who has the reference)
  const currentUser = await getCurrentUser();
  if (booking.userId !== "usr-guest" && currentUser && currentUser.role !== "admin") {
    if (booking.userId !== currentUser.id) {
      return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-xs text-zinc-400 mb-6">
            You do not have permission to view this ticket. You can only view tickets issued to your account.
          </p>
          <Link
            href="/history"
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
          >
            Go to My Bookings
          </Link>
        </div>
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Confirmation Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-lg shadow-emerald-950/40">
          <CheckCircle className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Booking Confirmed!</h1>
        <p className="text-zinc-400 text-sm mt-1.5">
          Your digital ticket pass has been generated. Save or print this pass for admission.
        </p>
      </div>

      {/* Ticket Pass View */}
      <TicketPass booking={booking} />

      {/* Bottom actions */}
      <div className="flex items-center justify-center gap-4 mt-8 print:hidden">
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
        >
          Book Another Movie
        </Link>
        <Link
          href="/history"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
        >
          View My Bookings
        </Link>
      </div>
    </div>
  );
}
