import { NextResponse } from "next/server";
import { createBooking, getUserBookings, getAllBookings } from "@/lib/data-store";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const createBookingSchema = z.object({
  showtimeId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  seatIds: z.array(z.string()).min(1),
  paymentIntentId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const result = createBookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid booking request parameters", details: result.error.issues },
        { status: 400 }
      );
    }

    const { showtimeId, customerName, customerEmail, seatIds, paymentIntentId } = result.data;
    const userId = user ? user.id : "usr-guest";

    const newBooking = await createBooking({
      userId,
      showtimeId,
      customerName,
      customerEmail,
      seatIds,
      paymentIntentId,
    });

    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "admin") {
    const all = await getAllBookings();
    return NextResponse.json({ bookings: all });
  }

  const userBookings = await getUserBookings(user.id);
  return NextResponse.json({ bookings: userBookings });
}
