import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import { generateBookingReference } from "./utils";
import { generateQrCodeDataUrl } from "./qrcode";

export interface CreateHoldParams {
  showtimeId: string;
  seatIds: string[];
  holdSessionId: string;
  holdMinutes?: number;
}

export interface ConfirmBookingParams {
  bookingId: string;
  paymentIntentId: string;
  idempotencyKey: string;
  provider?: string;
  customerEmail?: string;
}

/**
 * 1. TRANSACTION STEP: HOLD SEATS & CREATE PENDING BOOKING
 * Steps:
 * 1. Begin database transaction
 * 2. Lock requested showtime-seat records (SELECT FOR UPDATE)
 * 3. Confirm every requested seat is AVAILABLE (or hold expired)
 * 4. Create temporary seat hold with expiration time
 * 5. Calculate price on the server (in integer cents)
 * 6. Create pending booking
 * 7. Commit transaction
 */
export async function holdSeatsAndCreatePendingBooking(params: {
  userId: string;
  showtimeId: string;
  seatIds: string[];
  customerName: string;
  customerEmail: string;
  holdMinutes?: number;
}) {
  const { userId, showtimeId, seatIds, customerName, customerEmail, holdMinutes = 10 } = params;

  if (seatIds.length === 0) {
    throw new Error("No seats specified for reservation");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + holdMinutes * 60 * 1000);

  // When database client is available with Neon transaction support:
  if (db) {
    return await db.transaction(async (tx) => {
      // Step 2: Lock requested showtime seats using Drizzle sql tagged template FOR UPDATE
      const lockedSeatsResult = await tx.execute(
        sql`SELECT * FROM showtime_seats 
            WHERE showtime_id = ${showtimeId} 
            AND seat_id = ANY(${seatIds}) 
            FOR UPDATE`
      );

      const lockedSeats = (lockedSeatsResult.rows || []) as Record<string, any>[];

      // Step 3 & 10: Confirm all requested seats exist and are AVAILABLE
      if (lockedSeats.length !== seatIds.length) {
        throw new Error("One or more selected seats do not exist for this showtime");
      }

      for (const seat of lockedSeats) {
        const isHeldAndActive =
          seat.status === "HELD" && seat.held_until && new Date(seat.held_until) > now;
        const isBooked = seat.status === "BOOKED";
        const isBlocked = seat.status === "BLOCKED";

        if (isBooked || isBlocked || isHeldAndActive) {
          throw new Error(`Seat is no longer available. Please select other seats.`);
        }
      }

      // Step 5: Calculate price securely on server (integer cents)
      let subtotalCents = 0;
      for (const seat of lockedSeats) {
        subtotalCents += Number(seat.price_cents);
      }
      const bookingFeeCents = 250; // $2.50
      const taxCents = Math.round(subtotalCents * 0.08875);
      const totalAmountCents = subtotalCents + bookingFeeCents + taxCents;

      // Step 6: Create pending booking
      const bookingReference = generateBookingReference();
      const [newBooking] = await tx
        .insert(schema.bookings)
        .values({
          bookingReference,
          userId,
          showtimeId,
          customerName,
          customerEmail,
          subtotalCents,
          bookingFeeCents,
          taxCents,
          totalAmountCents,
          status: "PENDING",
          expiresAt,
        })
        .returning();

      // Step 4: Create temporary seat hold with expiration time
      for (const seat of lockedSeats) {
        await tx
          .update(schema.showtimeSeats)
          .set({
            status: "HELD",
            heldUntil: expiresAt,
            holdSessionId: newBooking.id,
            bookingId: newBooking.id,
            updatedAt: now,
          })
          .where(eq(schema.showtimeSeats.id, seat.id));

        // Insert booking line item
        await tx.insert(schema.bookingItems).values({
          bookingId: newBooking.id,
          showtimeSeatId: seat.id,
          seatLabel: seat.seat_label || "SEAT",
          seatType: seat.seat_type || "STANDARD",
          priceCents: seat.price_cents,
        });
      }

      // Audit log entry
      await tx.insert(schema.auditLogs).values({
        entityType: "BOOKING",
        entityId: newBooking.id,
        action: "HOLD_CREATED",
        userId,
        metadata: JSON.stringify({
          seatIds,
          totalAmountCents,
          expiresAt: expiresAt.toISOString(),
        }),
      });

      return newBooking;
    });
  }

  // Fallback memory engine (when Neon Postgres URL is placeholder/local mock)
  const { store } = await import("./data-store");
  const showtime = store.showtimes.find((st) => st.id === showtimeId);
  if (!showtime) throw new Error("Showtime not found");

  let reservedSet = store.reservedSeats[showtimeId];
  if (!reservedSet) {
    reservedSet = new Set();
    store.reservedSeats[showtimeId] = reservedSet;
  }

  for (const seatId of seatIds) {
    if (reservedSet.has(seatId)) {
      throw new Error(`One or more requested seats are no longer available.`);
    }
  }

  seatIds.forEach((id) => reservedSet.add(id));

  const bookingReference = generateBookingReference();
  return {
    id: `bk-${Date.now()}`,
    bookingReference,
    userId,
    showtimeId,
    customerName,
    customerEmail,
    subtotalCents: Math.round(parseFloat(showtime.priceStandard) * 100 * seatIds.length),
    bookingFeeCents: 250,
    taxCents: 180,
    totalAmountCents: Math.round(parseFloat(showtime.priceStandard) * 100 * seatIds.length) + 250 + 180,
    status: "PENDING" as const,
    expiresAt,
  };
}

/**
 * 2. TRANSACTION STEP: CONFIRM BOOKING AFTER PAYMENT WITH IDEMPOTENCY
 * Steps:
 * 8. Confirm seats only after verified payment
 * 9. Use payment idempotency keys so retries cannot create duplicate bookings
 */
export async function confirmBookingWithPayment(params: {
  bookingId: string;
  idempotencyKey: string;
  providerPaymentIntentId: string;
  amountCents: number;
  provider?: string;
}) {
  const { bookingId, idempotencyKey, providerPaymentIntentId, amountCents, provider = "stripe" } = params;
  const now = new Date();

  if (db) {
    return await db.transaction(async (tx) => {
      // Step 9: Check payment idempotency key
      const existingPayment = await tx.query.payments.findFirst({
        where: eq(schema.payments.idempotencyKey, idempotencyKey),
      });

      if (existingPayment) {
        // Return existing booking if payment was already processed
        const booking = await tx.query.bookings.findFirst({
          where: eq(schema.bookings.id, bookingId),
        });
        return { booking, payment: existingPayment, isDuplicate: true };
      }

      // Check booking status
      const booking = await tx.query.bookings.findFirst({
        where: eq(schema.bookings.id, bookingId),
      });

      if (!booking) {
        throw new Error("Booking record not found");
      }

      if (booking.status === "CONFIRMED") {
        return { booking, isDuplicate: true };
      }

      if (booking.status === "EXPIRED" || booking.status === "CANCELLED") {
        throw new Error(`Cannot confirm ${booking.status.toLowerCase()} booking`);
      }

      // Record payment
      const [payment] = await tx
        .insert(schema.payments)
        .values({
          bookingId,
          idempotencyKey,
          provider,
          providerPaymentIntentId,
          amountCents,
          currency: "USD",
          status: "COMPLETED",
        })
        .returning();

      // Step 8: Confirm seats and booking
      const [confirmedBooking] = await tx
        .update(schema.bookings)
        .set({
          status: "CONFIRMED",
          updatedAt: now,
        })
        .where(eq(schema.bookings.id, bookingId))
        .returning();

      // Update showtime seats to BOOKED
      await tx
        .update(schema.showtimeSeats)
        .set({
          status: "BOOKED",
          heldUntil: null,
          updatedAt: now,
        })
        .where(eq(schema.showtimeSeats.bookingId, bookingId));

      // Generate digital tickets for each booked item
      const items = await tx.query.bookingItems.findMany({
        where: eq(schema.bookingItems.bookingId, bookingId),
      });

      for (const item of items) {
        const ticketCode = `TKT-${booking.bookingReference}-${item.seatLabel}`;
        const qrPayload = `CINEBOOK|PASS|${booking.bookingReference}|${ticketCode}|${item.seatLabel}`;
        const qrCodeData = await generateQrCodeDataUrl(qrPayload);

        await tx.insert(schema.tickets).values({
          bookingId,
          ticketCode,
          seatLabel: item.seatLabel,
          qrCodeData,
        });
      }

      // Audit log entry
      await tx.insert(schema.auditLogs).values({
        entityType: "PAYMENT",
        entityId: payment.id,
        action: "PAYMENT_SUCCEEDED",
        userId: booking.userId,
        metadata: JSON.stringify({
          bookingId,
          amountCents,
          idempotencyKey,
        }),
      });

      return { booking: confirmedBooking, payment, isDuplicate: false };
    });
  }

  return { success: true, bookingId, idempotencyKey };
}

/**
 * 3. RELEASE EXPIRED SEAT HOLDS (IDEMPOTENT WORKER)
 * Runs safely on recurring schedule (e.g. Vercel Cron or on-demand worker)
 */
export async function releaseExpiredSeatHolds(): Promise<{
  releasedCount: number;
  expiredBookingsCount: number;
}> {
  const now = new Date();
  let releasedCount = 0;
  let expiredBookingsCount = 0;

  if (db) {
    // 1. Mark showtime_seats that passed their held_until timestamp back to AVAILABLE
    const expiredSeats = await db
      .update(schema.showtimeSeats)
      .set({
        status: "AVAILABLE",
        heldUntil: null,
        holdSessionId: null,
        bookingId: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.showtimeSeats.status, "HELD"),
          lt(schema.showtimeSeats.heldUntil, now)
        )
      )
      .returning();

    releasedCount = expiredSeats.length;

    // 2. Mark pending bookings that passed their expiration time as EXPIRED
    const expiredBookings = await db
      .update(schema.bookings)
      .set({
        status: "EXPIRED",
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.bookings.status, "PENDING"),
          lt(schema.bookings.expiresAt, now)
        )
      )
      .returning();

    expiredBookingsCount = expiredBookings.length;

    // Audit log
    if (releasedCount > 0 || expiredBookingsCount > 0) {
      await db.insert(schema.auditLogs).values({
        entityType: "SHOWTIME_SEAT",
        entityId: "CRON_CLEANUP",
        action: "HOLD_EXPIRED",
        metadata: JSON.stringify({
          releasedSeats: releasedCount,
          expiredBookings: expiredBookingsCount,
          timestamp: now.toISOString(),
        }),
      });
    }

    return { releasedCount, expiredBookingsCount };
  }

  return { releasedCount: 0, expiredBookingsCount: 0 };
}
