import { NextResponse } from "next/server";
import { releaseExpiredSeatHolds } from "@/lib/booking-engine";

/**
 * Idempotent server-side endpoint for releasing expired seat holds.
 * Protected with CRON_SECRET for Vercel Cron or Authorization Bearer header.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Verify secret if configured in production
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    const result = await releaseExpiredSeatHolds();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: unknown) {
    console.error("Cron hold release error:", error);
    const message = error instanceof Error ? error.message : "Failed to release holds";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
