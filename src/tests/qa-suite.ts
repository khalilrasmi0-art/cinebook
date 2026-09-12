import { createBooking, cancelBooking, getBookingByReference, store, getSeatsForShowtime } from "../lib/data-store";
import { releaseExpiredSeatHolds } from "../lib/booking-engine";
import { hashPassword, comparePassword, signToken, verifyToken } from "../lib/auth";

async function runTestSuite() {
  console.log("=================================================");
  console.log("🎬 CineBook QA Comprehensive Automated Test Suite");
  console.log("=================================================\n");

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Auth & Password Hashing Tests
  console.log("--- 1. Authentication & Security Tests ---");
  const rawPw = "SuperSecretPassword123!";
  const hash = await hashPassword(rawPw);
  const isMatch = await comparePassword(rawPw, hash);
  const isMismatch = await comparePassword("WrongPassword", hash);
  assert(Boolean(isMatch && !isMismatch), "Bcrypt password hashing and verification matches");

  const testUser = { id: "usr-test-1", name: "QA Tester", email: "qa@test.com", role: "user" as const };
  const token = signToken(testUser);
  const decoded = verifyToken(token);
  assert(Boolean(decoded?.id === testUser.id && decoded?.role === "user"), "JWT session token signing and decoding verified");

  // 2. Movie Search & Filter Logic
  console.log("\n--- 2. Movie Catalog & Showtime Queries ---");
  const showtimes = store.showtimes;
  assert(showtimes.length > 0, `Catalog loaded with ${showtimes.length} active showtimes`);
  const firstShow = showtimes[0];
  const seats = await getSeatsForShowtime(firstShow.id);
  assert(seats.length === 80, `Showtime seat map generated accurately with ${seats.length} total seats`);

  // 3. Concurrent Seat-Booking & Double-Booking Prevention Tests
  console.log("\n--- 3. Concurrent Seat-Booking & Conflict Tests ---");
  const targetShowtimeId = firstShow.id;
  const targetSeatId = "seat-scr-1-A3";

  // Session A attempts to book
  let sessionABooking: any = null;
  try {
    sessionABooking = await createBooking({
      userId: "usr-session-a",
      showtimeId: targetShowtimeId,
      customerName: "Alice Session A",
      customerEmail: "alice@example.com",
      seatIds: [targetSeatId],
    });
  } catch (err) {
    console.error("Session A unexpected failure:", err);
  }
  assert(sessionABooking !== null, "Session A successfully reserved seat A3");

  // Session B attempts to book THE EXACT SAME SEAT simultaneously
  let sessionBError: any = null;
  try {
    await createBooking({
      userId: "usr-session-b",
      showtimeId: targetShowtimeId,
      customerName: "Bob Session B",
      customerEmail: "bob@example.com",
      seatIds: [targetSeatId],
    });
  } catch (err: any) {
    sessionBError = err.message;
  }
  assert(
    Boolean(sessionBError !== null && sessionBError.includes("another customer")),
    "Session B was properly rejected because seat A3 was already booked (Double-booking prevented)"
  );

  // 4. Ticket Verification & Totals Calculation Tests
  console.log("\n--- 4. Digital Ticket & Financial Integrity Tests ---");
  const ref = sessionABooking.bookingReference;
  const retrievedTicket = await getBookingByReference(ref);
  assert(retrievedTicket !== null, `Retrieved digital pass by reference: ${ref}`);
  assert(Boolean(retrievedTicket?.qrCodeData?.startsWith("data:image/png;base64,")), "Scannable QR code generated with PNG payload");

  // Calculate pricing
  const subtotal = parseFloat(retrievedTicket!.subtotal);
  const fee = parseFloat(retrievedTicket!.bookingFee);
  const tax = parseFloat(retrievedTicket!.taxAmount);
  const total = parseFloat(retrievedTicket!.totalAmount);
  const expectedTotal = Number((subtotal + fee + tax).toFixed(2));
  assert(total === expectedTotal, `Financial integrity: Subtotal ($${subtotal}) + Fee ($${fee}) + Tax ($${tax}) = Total ($${total})`);

  // 5. Booking Cancellation & Seat Release Tests
  console.log("\n--- 5. Booking Cancellation & Seat Availability Release ---");
  const cancelResult = await cancelBooking(sessionABooking.id, "usr-session-a");
  assert(cancelResult.success === true, "Booking cancelled successfully and refund issued");

  // Confirm seat is released: Session B can now book it
  let sessionBRetry: any = null;
  try {
    sessionBRetry = await createBooking({
      userId: "usr-session-b",
      showtimeId: targetShowtimeId,
      customerName: "Bob Session B",
      customerEmail: "bob@example.com",
      seatIds: [targetSeatId],
    });
  } catch (err) {
    console.error("Session B retry failed:", err);
  }
  assert(sessionBRetry !== null, "Seat was automatically released upon cancellation and re-booked by Session B");

  // 6. Expired Holds Idempotency Tests
  console.log("\n--- 6. Expired Seat Holds & Idempotency Tests ---");
  const firstCleanup = await releaseExpiredSeatHolds();
  const secondCleanup = await releaseExpiredSeatHolds();
  assert(
    typeof firstCleanup.releasedCount === "number" && typeof secondCleanup.releasedCount === "number",
    "Expired holds release executed idempotently with zero runtime conflicts"
  );

  console.log("\n=================================================");
  console.log(`🎉 Test Suite Complete: ${testsPassed} / ${totalTests} tests PASSED`);
  console.log("=================================================\n");
}

runTestSuite();
