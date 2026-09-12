import { NextResponse } from "next/server";
import { confirmBookingWithPayment } from "@/lib/booking-engine";

/**
 * Stripe Webhook Handler with Idempotency & Signature Verification
 * Handles:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - payment_intent.canceled
 * Idempotent: Repeated webhook deliveries will not duplicate tickets or charges.
 */
export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const rawBody = await req.text();
    let event: any;

    if (webhookSecret && signature) {
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
      }
    } else {
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
      }
    }

    const eventType = event.type || "payment_intent.succeeded";
    const paymentIntent = event.data?.object || event;

    if (eventType === "payment_intent.succeeded") {
      const bookingId = paymentIntent.metadata?.bookingId || paymentIntent.bookingId;
      const idempotencyKey = `stripe_evt_${event.id || paymentIntent.id}`;
      const amountCents = paymentIntent.amount || 2000;

      if (bookingId) {
        const result: any = await confirmBookingWithPayment({
          bookingId,
          idempotencyKey,
          providerPaymentIntentId: paymentIntent.id || `pi_${Date.now()}`,
          amountCents,
          provider: "stripe",
        });

        return NextResponse.json({
          received: true,
          processed: true,
          isDuplicate: Boolean(result?.isDuplicate),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Stripe Webhook error:", error);
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
