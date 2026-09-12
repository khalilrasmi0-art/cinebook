import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

// --- ENUMS ---
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const seatTypeEnum = pgEnum("seat_type", ["STANDARD", "VIP", "ACCESSIBLE"]);
export const seatStatusEnum = pgEnum("seat_status", ["AVAILABLE", "HELD", "BOOKED", "BLOCKED"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

// 1. Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// 2. Movies
export const movies = pgTable("movies", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  synopsis: text("synopsis").notNull(),
  director: text("director").notNull(),
  castMembers: text("cast_members").notNull(),
  language: text("language").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  mpaaRating: text("mpaa_rating").notNull().default("PG-13"),
  posterUrl: text("poster_url").notNull(),
  backdropUrl: text("backdrop_url").notNull(),
  trailerUrl: text("trailer_url"),
  releaseDate: text("release_date").notNull(),
  ratingScore: integer("rating_score").default(85).notNull(), // stored as integer (e.g. 85 = 8.5)
  isNowShowing: boolean("is_now_showing").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// 3. Genres
export const genres = pgTable("genres", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// 4. Movie Genres (Join Table)
export const movieGenres = pgTable(
  "movie_genres",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("unique_movie_genre").on(table.movieId, table.genreId),
    index("movie_genres_movie_idx").on(table.movieId),
    index("movie_genres_genre_idx").on(table.genreId),
  ]
);

// 5. Cinemas
export const cinemas = pgTable("cinemas", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  imageUrl: text("image_url").notNull(),
  phone: text("phone"),
  amenities: text("amenities").array(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// 6. Auditoriums (Screens)
export const auditoriums = pgTable(
  "auditoriums",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cinemaId: uuid("cinema_id")
      .notNull()
      .references(() => cinemas.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g. "Auditorium 1 - IMAX Laser"
    formatType: text("format_type").default("Standard").notNull(),
    totalRows: integer("total_rows").notNull().default(8),
    totalCols: integer("total_cols").notNull().default(10),
    capacity: integer("capacity").notNull().default(80),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    // Unique constraint for cinema screen names
    uniqueIndex("unique_cinema_auditorium_name").on(table.cinemaId, table.name),
    index("auditoriums_cinema_idx").on(table.cinemaId),
  ]
);

// 7. Seats (Physical seats in auditorium)
export const seats = pgTable(
  "seats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    auditoriumId: uuid("auditorium_id")
      .notNull()
      .references(() => auditoriums.id, { onDelete: "cascade" }),
    rowLabel: text("row_label").notNull(), // e.g. "A", "B", "C"
    seatNumber: integer("seat_number").notNull(), // 1, 2, 3...
    seatType: seatTypeEnum("seat_type").default("STANDARD").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    // Unique constraint for auditorium seat positions
    uniqueIndex("unique_auditorium_seat_position").on(
      table.auditoriumId,
      table.rowLabel,
      table.seatNumber
    ),
    index("seats_auditorium_idx").on(table.auditoriumId),
  ]
);

// 8. Showtimes
export const showtimes = pgTable(
  "showtimes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    auditoriumId: uuid("auditorium_id")
      .notNull()
      .references(() => auditoriums.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time", { withTimezone: true, mode: "date" }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true, mode: "date" }).notNull(),
    experienceFormat: text("experience_format").default("2D").notNull(),
    // Money stored as integer minor units (e.g. 1450 = $14.50)
    priceStandardCents: integer("price_standard_cents").notNull().default(1450),
    priceVipCents: integer("price_vip_cents").notNull().default(2250),
    priceAccessibleCents: integer("price_accessible_cents").notNull().default(1200),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("showtimes_movie_idx").on(table.movieId),
    index("showtimes_auditorium_idx").on(table.auditoriumId),
    index("showtimes_start_time_idx").on(table.startTime),
  ]
);

// 9. Showtime Seats (Real-time inventory per showtime)
export const showtimeSeats = pgTable(
  "showtime_seats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    showtimeId: uuid("showtime_id")
      .notNull()
      .references(() => showtimes.id, { onDelete: "cascade" }),
    seatId: uuid("seat_id")
      .notNull()
      .references(() => seats.id, { onDelete: "cascade" }),
    status: seatStatusEnum("status").default("AVAILABLE").notNull(), // AVAILABLE, HELD, BOOKED, BLOCKED
    heldUntil: timestamp("held_until", { withTimezone: true, mode: "date" }),
    holdSessionId: text("hold_session_id"),
    bookingId: uuid("booking_id"), // linked when booked
    priceCents: integer("price_cents").notNull(), // price locked in cents
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    // Unique constraint preventing the same showtime seat from being duplicated
    uniqueIndex("unique_showtime_seat").on(table.showtimeId, table.seatId),
    index("showtime_seats_status_idx").on(table.status),
    index("showtime_seats_showtime_idx").on(table.showtimeId),
    index("showtime_seats_held_until_idx").on(table.heldUntil),
  ]
);

// 10. Bookings
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingReference: text("booking_reference").notNull().unique(), // e.g. "CB-9482-1928"
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    showtimeId: uuid("showtime_id")
      .notNull()
      .references(() => showtimes.id, { onDelete: "cascade" }),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    // Stored as integer cents
    subtotalCents: integer("subtotal_cents").notNull(),
    bookingFeeCents: integer("booking_fee_cents").notNull().default(250), // $2.50
    taxCents: integer("tax_cents").notNull().default(180),
    totalAmountCents: integer("total_amount_cents").notNull(),
    status: bookingStatusEnum("status").default("PENDING").notNull(), // PENDING, CONFIRMED, CANCELLED, EXPIRED, REFUNDED
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("bookings_user_idx").on(table.userId),
    index("bookings_showtime_idx").on(table.showtimeId),
    index("bookings_ref_idx").on(table.bookingReference),
    index("bookings_status_idx").on(table.status),
    index("bookings_expires_at_idx").on(table.expiresAt),
  ]
);

// 11. Booking Items (Individual seat line-items for a booking)
export const bookingItems = pgTable(
  "booking_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    showtimeSeatId: uuid("showtime_seat_id")
      .notNull()
      .references(() => showtimeSeats.id, { onDelete: "restrict" }),
    seatLabel: text("seat_label").notNull(), // e.g. "D7"
    seatType: seatTypeEnum("seat_type").notNull(),
    priceCents: integer("price_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    // Unique constraint: A showtime_seat can only be in one booking item
    uniqueIndex("unique_booking_item_showtime_seat").on(table.showtimeSeatId),
    index("booking_items_booking_idx").on(table.bookingId),
  ]
);

// 12. Payments (Separated from Booking status, includes Idempotency key)
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull().unique(), // prevent duplicate payments on retry
    provider: text("provider").default("stripe").notNull(),
    providerPaymentIntentId: text("provider_payment_intent_id").unique(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").default("USD").notNull(),
    status: paymentStatusEnum("status").default("PENDING").notNull(), // PENDING, COMPLETED, FAILED, REFUNDED
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("payments_booking_idx").on(table.bookingId),
    index("payments_idempotency_idx").on(table.idempotencyKey),
  ]
);

// 13. Tickets (Issued admission passes with QR payload)
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    ticketCode: text("ticket_code").notNull().unique(), // e.g. "TKT-CB-94821-D7"
    seatLabel: text("seat_label").notNull(),
    qrCodeData: text("qr_code_data").notNull(),
    isUsed: boolean("is_used").default(false).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("tickets_booking_idx").on(table.bookingId),
    index("tickets_code_idx").on(table.ticketCode),
  ]
);

// 14. Audit Logs (Complete event trail for bookings, holds, cancellations, payments)
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entityType: text("entity_type").notNull(), // "BOOKING", "PAYMENT", "SHOWTIME_SEAT", "TICKET"
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(), // "HOLD_CREATED", "BOOKING_CREATED", "PAYMENT_SUCCEEDED", "HOLD_EXPIRED", "BOOKING_CANCELLED"
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    metadata: text("metadata"), // JSON stringified data
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

// Aliases for compatibility with screens/auditoriums
export const screens = auditoriums;

// Inferred TypeScript Types
export type User = typeof users.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type Genre = typeof genres.$inferSelect;
export type MovieGenre = typeof movieGenres.$inferSelect;
export type Cinema = typeof cinemas.$inferSelect;
export type Auditorium = typeof auditoriums.$inferSelect;
export type Seat = typeof seats.$inferSelect;
export type Showtime = typeof showtimes.$inferSelect;
export type ShowtimeSeat = typeof showtimeSeats.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type BookingItem = typeof bookingItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
