import {
  MovieItem,
  CinemaItem,
  ShowtimeItem,
  SeatItem,
  BookingItem,
  UserSession,
} from "@/types";
import {
  INITIAL_CINEMAS,
  INITIAL_MOVIES,
  INITIAL_SCREENS,
  generateInitialShowtimes,
  generateSeatsForScreen,
} from "./mock-data";
import { generateBookingReference } from "./utils";
import { generateQrCodeDataUrl } from "./qrcode";

// In-Memory Global Store (used when Neon credentials are still being linked or local dev)
interface StoreState {
  users: (UserSession & { passwordHash: string })[];
  cinemas: CinemaItem[];
  movies: MovieItem[];
  showtimes: ShowtimeItem[];
  seats: Record<string, SeatItem[]>; // screenId -> SeatItem[]
  bookings: BookingItem[];
  reservedSeats: Record<string, Set<string>>; // showtimeId -> Set of seatIds
}

// Persist in global for Next.js hot reload support in dev mode
const globalStore = global as unknown as { __CINEBOOK_STORE__?: StoreState };

function initStore(): StoreState {
  const showtimes = generateInitialShowtimes();
  const seats: Record<string, SeatItem[]> = {};

  INITIAL_SCREENS.forEach((scr) => {
    seats[scr.id] = generateSeatsForScreen(scr.id);
  });

  // Valid bcrypt hash for "password123"
  const defaultHash = "$2b$10$Jcf88zO4QEWVVXO8XE8SKez80HjTo53RxAhhxnfxh4xh3jL6GwDWG";

  const users = [
    {
      id: "usr-demo",
      name: "Alex Johnson",
      email: "alex@cinebook.com",
      role: "user" as const,
      passwordHash: defaultHash,
    },
    {
      id: "usr-admin",
      name: "CineBook Manager",
      email: "admin@cinebook.com",
      role: "admin" as const,
      passwordHash: defaultHash,
    },
  ];

  // Pre-seed a couple sample reserved seats for realistic real-time UI
  const reservedSeats: Record<string, Set<string>> = {};
  if (showtimes.length > 0) {
    const firstShow = showtimes[0].id;
    reservedSeats[firstShow] = new Set([
      "seat-scr-1-D5",
      "seat-scr-1-D6",
      "seat-scr-1-E5",
      "seat-scr-1-E6",
    ]);
  }

  return {
    users,
    cinemas: [...INITIAL_CINEMAS],
    movies: [...INITIAL_MOVIES],
    showtimes,
    seats,
    bookings: [],
    reservedSeats,
  };
}

// Force re-init with correct bcrypt hash
globalStore.__CINEBOOK_STORE__ = initStore();

export const store = globalStore.__CINEBOOK_STORE__;

// Helper DB Services
export async function getMovies(filters?: {
  query?: string;
  genre?: string;
  language?: string;
  cinemaId?: string;
  date?: string;
}): Promise<MovieItem[]> {
  let list = [...store.movies];

  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.castMembers.toLowerCase().includes(q)
    );
  }

  if (filters?.genre && filters.genre !== "all") {
    list = list.filter((m) =>
      m.genre.toLowerCase().includes(filters.genre!.toLowerCase())
    );
  }

  if (filters?.language && filters.language !== "all") {
    list = list.filter(
      (m) => m.language.toLowerCase() === filters.language!.toLowerCase()
    );
  }

  if (filters?.cinemaId && filters.cinemaId !== "all") {
    const allowedMovieIds = new Set(
      store.showtimes
        .filter((st) => {
          const screen = INITIAL_SCREENS.find((s) => s.id === st.screenId);
          return screen?.cinemaId === filters.cinemaId;
        })
        .map((st) => st.movieId)
    );
    list = list.filter((m) => allowedMovieIds.has(m.id));
  }

  if (filters?.date && filters.date !== "all") {
    const allowedMovieIds = new Set(
      store.showtimes
        .filter((st) => st.startTime.startsWith(filters.date!))
        .map((st) => st.movieId)
    );
    list = list.filter((m) => allowedMovieIds.has(m.id));
  }

  return list;
}

export async function getMovieBySlug(slug: string): Promise<MovieItem | null> {
  return store.movies.find((m) => m.slug === slug) || null;
}

export async function getMovieById(id: string): Promise<MovieItem | null> {
  return store.movies.find((m) => m.id === id) || null;
}

export async function getCinemas(): Promise<CinemaItem[]> {
  return store.cinemas;
}

export async function getCinemaById(id: string): Promise<CinemaItem | null> {
  return store.cinemas.find((c) => c.id === id) || null;
}

export async function getShowtimesForMovie(movieId: string): Promise<ShowtimeItem[]> {
  return store.showtimes.filter((st) => st.movieId === movieId);
}

export async function getShowtimeById(id: string): Promise<ShowtimeItem | null> {
  return store.showtimes.find((st) => st.id === id) || null;
}

export async function getSeatsForShowtime(showtimeId: string): Promise<SeatItem[]> {
  const showtime = await getShowtimeById(showtimeId);
  if (!showtime) return [];

  const screenSeats = store.seats[showtime.screenId] || [];
  const reservedSet = store.reservedSeats[showtimeId] || new Set();

  return screenSeats.map((seat) => ({
    ...seat,
    isReserved: reservedSet.has(seat.id),
  }));
}

export async function createBooking(params: {
  userId: string;
  showtimeId: string;
  customerName: string;
  customerEmail: string;
  seatIds: string[];
  paymentIntentId?: string;
}): Promise<BookingItem> {
  const showtime = await getShowtimeById(params.showtimeId);
  if (!showtime) throw new Error("Showtime not found");

  const movie = await getMovieById(showtime.movieId);
  const cinema = store.cinemas.find((c) => c.name === showtime.cinemaName);

  // Atomic seat collision check
  let reservedSet = store.reservedSeats[params.showtimeId];
  if (!reservedSet) {
    reservedSet = new Set();
    store.reservedSeats[params.showtimeId] = reservedSet;
  }

  for (const seatId of params.seatIds) {
    if (reservedSet.has(seatId)) {
      throw new Error(`Seat ${seatId} was just booked by another customer. Please choose another seat.`);
    }
  }

  // Calculate pricing
  const screenSeats = store.seats[showtime.screenId] || [];
  let subtotal = 0;
  const bookedSeatsList: { seatLabel: string; seatType: string; pricePaid: string }[] = [];

  for (const seatId of params.seatIds) {
    const seatObj = screenSeats.find((s) => s.id === seatId);
    let price = parseFloat(showtime.priceStandard);
    if (seatObj?.seatType === "vip") {
      price = parseFloat(showtime.priceVip);
    } else if (seatObj?.seatType === "accessible") {
      price = parseFloat(showtime.priceAccessible);
    }

    subtotal += price;
    reservedSet.add(seatId);

    bookedSeatsList.push({
      seatLabel: `${seatObj?.rowLabel}${seatObj?.seatNumber}`,
      seatType: seatObj?.seatType || "standard",
      pricePaid: price.toFixed(2),
    });
  }

  const bookingFee = 2.50;
  const taxAmount = Number((subtotal * 0.08875).toFixed(2));
  const totalAmount = Number((subtotal + bookingFee + taxAmount).toFixed(2));

  const bookingReference = generateBookingReference();
  const qrDataUrl = await generateQrCodeDataUrl(
    `CINEBOOK-VERIFY|${bookingReference}|${showtime.movieTitle}|${showtime.startTime}|SEATS:${bookedSeatsList.map(s => s.seatLabel).join(",")}`
  );

  const newBooking: BookingItem = {
    id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookingReference,
    userId: params.userId,
    showtimeId: params.showtimeId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    subtotal: subtotal.toFixed(2),
    bookingFee: bookingFee.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    status: "confirmed",
    paymentStatus: "paid",
    paymentIntentId: params.paymentIntentId || `pi_test_${Date.now()}`,
    qrCodeData: qrDataUrl,
    createdAt: new Date().toISOString(),
    movieTitle: movie?.title || showtime.movieTitle,
    moviePoster: movie?.posterUrl || showtime.moviePoster,
    cinemaName: showtime.cinemaName || cinema?.name,
    cinemaAddress: showtime.cinemaAddress || cinema?.address,
    screenName: showtime.screenName,
    startTime: showtime.startTime,
    seats: bookedSeatsList,
  };

  store.bookings.unshift(newBooking);
  return newBooking;
}

export async function getBookingByReference(reference: string): Promise<BookingItem | null> {
  return store.bookings.find((b) => b.bookingReference.toUpperCase() === reference.toUpperCase()) || null;
}

export async function getUserBookings(userId: string): Promise<BookingItem[]> {
  return store.bookings.filter((b) => b.userId === userId);
}

export async function cancelBooking(bookingId: string, userId: string): Promise<{ success: boolean; message: string }> {
  const booking = store.bookings.find((b) => b.id === bookingId && b.userId === userId);
  if (!booking) {
    return { success: false, message: "Booking not found" };
  }

  if (booking.status === "cancelled") {
    return { success: false, message: "Booking is already cancelled" };
  }

  // Release the seats
  const reservedSet = store.reservedSeats[booking.showtimeId];
  if (reservedSet && booking.seats) {
    const showtime = await getShowtimeById(booking.showtimeId);
    if (showtime) {
      const screenSeats = store.seats[showtime.screenId] || [];
      booking.seats.forEach((bookedSeat) => {
        const matchingSeat = screenSeats.find(
          (s) => `${s.rowLabel}${s.seatNumber}` === bookedSeat.seatLabel
        );
        if (matchingSeat) {
          reservedSet.delete(matchingSeat.id);
        }
      });
    }
  }

  booking.status = "cancelled";
  booking.paymentStatus = "refunded";

  return { success: true, message: "Booking cancelled successfully. Seats have been released and refund processed." };
}

// Admin Operations
export async function addMovie(movie: Omit<MovieItem, "id">): Promise<MovieItem> {
  const newMovie: MovieItem = {
    ...movie,
    id: `mov-${Date.now()}`,
  };
  store.movies.unshift(newMovie);
  return newMovie;
}

export async function deleteMovie(id: string): Promise<boolean> {
  const idx = store.movies.findIndex((m) => m.id === id);
  if (idx !== -1) {
    store.movies.splice(idx, 1);
    // remove corresponding showtimes
    store.showtimes = store.showtimes.filter((st) => st.movieId !== id);
    return true;
  }
  return false;
}

export async function getAllBookings(): Promise<BookingItem[]> {
  return store.bookings;
}
