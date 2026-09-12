import { NextResponse } from "next/server";
import { cancelBooking } from "@/lib/data-store";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const cancelSchema = z.object({
  bookingId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to manage your bookings." }, { status: 401 });
    }

    const body = await req.json();
    const result = cancelSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const res = await cancelBooking(result.data.bookingId, user.id);
    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: res.message });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error cancelling booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
