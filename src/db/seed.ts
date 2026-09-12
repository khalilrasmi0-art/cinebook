import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import {
  INITIAL_CINEMAS,
  INITIAL_MOVIES,
  INITIAL_SCREENS,
  generateInitialShowtimes,
  generateSeatsForScreen,
} from "../lib/mock-data";
import bcrypt from "bcryptjs";

export async function runDatabaseSeed(targetConnectionString?: string) {
  const connectionString = targetConnectionString || process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("placeholder")) {
    console.log("ℹ️ No active Neon DATABASE_URL provided. App operates with active in-memory seeded store.");
    return { success: true, seededOffline: true };
  }

  console.log("🌱 Starting Neon PostgreSQL database migration and seed...");
  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  try {
    // 1. Insert default users
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("password123", salt);

    console.log("-> Seeding users...");
    const [userCust] = await db
      .insert(schema.users)
      .values([
        {
          name: "Alex Johnson",
          email: "alex@cinebook.com",
          passwordHash: hash,
          role: "user",
        },
        {
          name: "CineBook Admin",
          email: "admin@cinebook.com",
          passwordHash: hash,
          role: "admin",
        },
      ])
      .onConflictDoNothing()
      .returning();

    // 2. Insert standard genres
    console.log("-> Seeding genres...");
    const genreMap: Record<string, string> = {};
    const genreNames = ["Action", "Sci-Fi", "Drama", "Adventure", "Cyberpunk", "Romance", "Mystery", "Epic", "Musical"];
    for (const name of genreNames) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const [g] = await db
        .insert(schema.genres)
        .values({ name, slug })
        .onConflictDoNothing()
        .returning();
      if (g) genreMap[name] = g.id;
    }

    // 3. Insert cinemas
    console.log("-> Seeding cinemas...");
    const cinemaMap: Record<string, string> = {};
    for (const cin of INITIAL_CINEMAS) {
      const [c] = await db
        .insert(schema.cinemas)
        .values({
          name: cin.name,
          slug: cin.slug,
          address: cin.address,
          city: cin.city,
          state: cin.state,
          imageUrl: cin.imageUrl,
          phone: cin.phone,
          amenities: cin.amenities,
        })
        .onConflictDoNothing()
        .returning();
      if (c) cinemaMap[cin.id] = c.id;
    }

    // 4. Insert auditoriums (screens)
    console.log("-> Seeding auditoriums & seats...");
    const screenMap: Record<string, string> = {};
    for (const scr of INITIAL_SCREENS) {
      const cinemaDbId = cinemaMap[scr.cinemaId];
      if (!cinemaDbId) continue;

      const [aud] = await db
        .insert(schema.auditoriums)
        .values({
          cinemaId: cinemaDbId,
          name: scr.name,
          formatType: scr.formatType,
          totalRows: scr.totalRows,
          totalCols: scr.totalCols,
          capacity: scr.capacity,
        })
        .onConflictDoNothing()
        .returning();

      if (!aud) continue;
      screenMap[scr.id] = aud.id;

      // Seed physical seats for this auditorium
      const seats = generateSeatsForScreen(scr.id);
      for (const st of seats) {
        await db
          .insert(schema.seats)
          .values({
            auditoriumId: aud.id,
            rowLabel: st.rowLabel,
            seatNumber: st.seatNumber,
            seatType: (st.seatType.toUpperCase() as "STANDARD" | "VIP" | "ACCESSIBLE"),
            isActive: true,
          })
          .onConflictDoNothing();
      }
    }

    // 5. Insert movies
    console.log("-> Seeding movies...");
    const movieMap: Record<string, string> = {};
    for (const m of INITIAL_MOVIES) {
      const [movie] = await db
        .insert(schema.movies)
        .values({
          title: m.title,
          slug: m.slug,
          synopsis: m.synopsis,
          director: m.director,
          castMembers: m.castMembers,
          language: m.language,
          durationMinutes: m.durationMinutes,
          mpaaRating: m.mpaaRating,
          posterUrl: m.posterUrl,
          backdropUrl: m.backdropUrl,
          trailerUrl: m.trailerUrl,
          releaseDate: m.releaseDate,
          ratingScore: Math.round(parseFloat(m.ratingScore) * 10),
          isNowShowing: m.isNowShowing,
        })
        .onConflictDoNothing()
        .returning();

      if (movie) {
        movieMap[m.id] = movie.id;
      }
    }

    // 6. Insert Showtimes and link Showtime Seats
    console.log("-> Seeding showtimes & inventory...");
    const initialShowtimes = generateInitialShowtimes();
    for (const st of initialShowtimes.slice(0, 15)) {
      const movieDbId = movieMap[st.movieId];
      const audDbId = screenMap[st.screenId];
      if (!movieDbId || !audDbId) continue;

      const [show] = await db
        .insert(schema.showtimes)
        .values({
          movieId: movieDbId,
          auditoriumId: audDbId,
          startTime: new Date(st.startTime),
          endTime: new Date(st.endTime),
          experienceFormat: st.experienceFormat,
          priceStandardCents: Math.round(parseFloat(st.priceStandard) * 100),
          priceVipCents: Math.round(parseFloat(st.priceVip) * 100),
          priceAccessibleCents: Math.round(parseFloat(st.priceAccessible) * 100),
        })
        .returning();

      if (show) {
        // Query physical seats for this auditorium to instantiate showtime_seats
        const physicalSeats = await db.query.seats.findMany({
          where: (fields, ops) => ops.eq(fields.auditoriumId, audDbId),
        });

        for (const ps of physicalSeats) {
          let priceCents = show.priceStandardCents;
          if (ps.seatType === "VIP") priceCents = show.priceVipCents;
          if (ps.seatType === "ACCESSIBLE") priceCents = show.priceAccessibleCents;

          await db.insert(schema.showtimeSeats).values({
            showtimeId: show.id,
            seatId: ps.id,
            status: "AVAILABLE",
            priceCents,
          }).onConflictDoNothing();
        }
      }
    }

    console.log("✅ Comprehensive Neon Database seed finished successfully!");
    return { success: true };
  } catch (err) {
    console.error("❌ Error during DB seed:", err);
    return { success: false, error: err };
  }
}

// Run if called directly
runDatabaseSeed();
