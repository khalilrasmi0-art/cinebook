export interface MovieItem {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  director: string;
  castMembers: string;
  genre: string;
  language: string;
  durationMinutes: number;
  mpaaRating: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string | null;
  releaseDate: string;
  ratingScore: string;
  isNowShowing: boolean;
}

export interface CinemaItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  imageUrl: string;
  phone?: string | null;
  amenities: string[];
}

export interface ScreenItem {
  id: string;
  cinemaId: string;
  name: string;
  formatType: string;
  totalRows: number;
  totalCols: number;
  capacity: number;
}

export interface ShowtimeItem {
  id: string;
  movieId: string;
  screenId: string;
  startTime: string; // ISO string
  endTime: string;
  experienceFormat: string;
  priceStandard: string;
  priceVip: string;
  priceAccessible: string;
  // joined fields
  movieTitle?: string;
  moviePoster?: string;
  cinemaName?: string;
  cinemaAddress?: string;
  cinemaCity?: string;
  screenName?: string;
}

export interface SeatItem {
  id: string;
  screenId: string;
  rowLabel: string;
  seatNumber: number;
  seatType: "standard" | "vip" | "accessible";
  isActive: boolean;
  isReserved?: boolean;
}

export interface BookingItem {
  id: string;
  bookingReference: string;
  userId: string;
  showtimeId: string;
  customerName: string;
  customerEmail: string;
  subtotal: string;
  bookingFee: string;
  taxAmount: string;
  totalAmount: string;
  status: "confirmed" | "cancelled" | "refunded";
  paymentStatus: "paid" | "pending" | "refunded";
  paymentIntentId?: string | null;
  qrCodeData: string;
  createdAt: string;
  // Joined detail
  movieTitle?: string;
  moviePoster?: string;
  cinemaName?: string;
  cinemaAddress?: string;
  screenName?: string;
  startTime?: string;
  seats?: {
    seatLabel: string;
    seatType: string;
    pricePaid: string;
  }[];
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}
