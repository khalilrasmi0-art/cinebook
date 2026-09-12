import { MovieItem, CinemaItem, ScreenItem, ShowtimeItem, SeatItem, BookingItem } from "@/types";

export const INITIAL_CINEMAS: CinemaItem[] = [
  {
    id: "cin-1",
    name: "CineBook Grand IMAX Cinema",
    slug: "cinebook-grand-imax",
    address: "742 Evergreen Blvd, Downtown",
    city: "New York",
    state: "NY",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    phone: "(212) 555-0199",
    amenities: ["IMAX Laser", "Dolby Atmos", "Recliner Loungers", "Craft Bar & Dine-In"],
  },
  {
    id: "cin-2",
    name: "CineBook Premiere Lux & 4DX",
    slug: "cinebook-premiere-lux",
    address: "100 Sunset Galleria, West End",
    city: "Los Angeles",
    state: "CA",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    phone: "(310) 555-0144",
    amenities: ["4DX Motion Seats", "Dolby Vision", "Gourmet Concessions", "VIP Lounge"],
  },
  {
    id: "cin-3",
    name: "CineBook Starlight Harbor Theaters",
    slug: "cinebook-starlight-harbor",
    address: "50 Marina Promenade",
    city: "San Francisco",
    state: "CA",
    imageUrl: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=80",
    phone: "(415) 555-0182",
    amenities: ["Dual Laser IMAX", "Heated Recliners", "Reserved Valet", "Cocktail Bar"],
  },
];

export const INITIAL_MOVIES: MovieItem[] = [
  {
    id: "mov-1",
    title: "Dune: Part Two",
    slug: "dune-part-two",
    synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.",
    director: "Denis Villeneuve",
    castMembers: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler",
    genre: "Sci-Fi / Adventure",
    language: "English",
    durationMinutes: 166,
    mpaaRating: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    releaseDate: "2024-03-01",
    ratingScore: "8.6",
    isNowShowing: true,
  },
  {
    id: "mov-2",
    title: "Interstellar: Re-Mastered",
    slug: "interstellar-remastered",
    synopsis: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
    director: "Christopher Nolan",
    castMembers: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine",
    genre: "Sci-Fi / Drama",
    language: "English",
    durationMinutes: 169,
    mpaaRating: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    releaseDate: "2024-10-15",
    ratingScore: "8.9",
    isNowShowing: true,
  },
  {
    id: "mov-3",
    title: "Neon Horizon: Cyber Tokyo",
    slug: "neon-horizon-cyber-tokyo",
    synopsis: "In a neon-drenched futuristic metropolis, an underground cyber-detective uncovers a synthetic intelligence conspiracy threatening to overwrite human consciousness.",
    director: "Kenji Sato",
    castMembers: "Rinko Kikuchi, Hiroyuki Sanada, Steven Yeun",
    genre: "Action / Cyberpunk",
    language: "Japanese",
    durationMinutes: 128,
    mpaaRating: "R",
    posterUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    releaseDate: "2024-11-20",
    ratingScore: "8.2",
    isNowShowing: true,
  },
  {
    id: "mov-4",
    title: "The French Riviera Affair",
    slug: "the-french-riviera-affair",
    synopsis: "An elegant high-stakes jewel heist unravels along the sun-soaked Mediterranean coast when a master thief meets her match in an international art curator.",
    director: "Claire Denis",
    castMembers: "Léa Seydoux, Vincent Cassel, Marion Cotillard",
    genre: "Mystery / Romance",
    language: "French",
    durationMinutes: 114,
    mpaaRating: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    releaseDate: "2024-12-05",
    ratingScore: "7.8",
    isNowShowing: true,
  },
  {
    id: "mov-5",
    title: "El Destino: Echoes of Andes",
    slug: "el-destino-echoes-of-andes",
    synopsis: "A passionate multi-generational family epic tracing legendary musicians through the mystical peaks and colorful valleys of South America.",
    director: "Alejandro González",
    castMembers: "Pedro Pascal, Ana de Armas, Gael García Bernal",
    genre: "Drama / Musical",
    language: "Spanish",
    durationMinutes: 135,
    mpaaRating: "PG",
    posterUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    releaseDate: "2025-01-10",
    ratingScore: "8.4",
    isNowShowing: true,
  },
  {
    id: "mov-6",
    title: "Gladiator II",
    slug: "gladiator-ii",
    synopsis: "Years after witnessing the death of revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
    director: "Ridley Scott",
    castMembers: "Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen",
    genre: "Action / Epic",
    language: "English",
    durationMinutes: 148,
    mpaaRating: "R",
    posterUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    releaseDate: "2024-11-22",
    ratingScore: "8.1",
    isNowShowing: true,
  }
];

export const INITIAL_SCREENS: ScreenItem[] = [
  { id: "scr-1", cinemaId: "cin-1", name: "Grand Auditorium 1 (IMAX)", formatType: "IMAX Laser", totalRows: 8, totalCols: 10, capacity: 80 },
  { id: "scr-2", cinemaId: "cin-1", name: "Auditorium 2 (Dolby)", formatType: "Dolby Atmos", totalRows: 8, totalCols: 10, capacity: 80 },
  { id: "scr-3", cinemaId: "cin-2", name: "Screen 1 - 4DX Dynamic", formatType: "4DX Dynamic", totalRows: 8, totalCols: 10, capacity: 80 },
  { id: "scr-4", cinemaId: "cin-2", name: "Screen 2 - VIP Lounger", formatType: "VIP Lounger", totalRows: 8, totalCols: 10, capacity: 80 },
  { id: "scr-5", cinemaId: "cin-3", name: "Harbor Screen 1 (Laser)", formatType: "Dual Laser", totalRows: 8, totalCols: 10, capacity: 80 },
];

export function generateSeatsForScreen(screenId: string): SeatItem[] {
  const seats: SeatItem[] = [];
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const cols = 10;

  for (const row of rows) {
    for (let col = 1; col <= cols; col++) {
      let seatType: "standard" | "vip" | "accessible" = "standard";
      if (row === "G" || row === "H") {
        seatType = "vip"; // Back rows are VIP loungers
      } else if (row === "A" && (col === 1 || col === 2 || col === 9 || col === 10)) {
        seatType = "accessible"; // Front corners accessible
      }

      seats.push({
        id: `seat-${screenId}-${row}${col}`,
        screenId,
        rowLabel: row,
        seatNumber: col,
        seatType,
        isActive: true,
      });
    }
  }
  return seats;
}

// Generate dynamic showtimes for the next 7 days
export function generateInitialShowtimes(): ShowtimeItem[] {
  const showtimes: ShowtimeItem[] = [];
  let showtimeIdCounter = 1;

  const today = new Date();
  const times = [
    { hour: 13, min: 0 },
    { hour: 16, min: 30 },
    { hour: 19, min: 45 },
    { hour: 22, min: 15 },
  ];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);

    INITIAL_MOVIES.forEach((movie, mIdx) => {
      // Rotate cinemas and screens
      const cinema = INITIAL_CINEMAS[mIdx % INITIAL_CINEMAS.length];
      const screen = INITIAL_SCREENS.find((s) => s.cinemaId === cinema.id) || INITIAL_SCREENS[0];

      times.slice(0, (mIdx % 2 === 0 ? 3 : 2)).forEach((timeSlot) => {
        const start = new Date(targetDate);
        start.setHours(timeSlot.hour, timeSlot.min, 0, 0);

        const end = new Date(start);
        end.setMinutes(start.getMinutes() + movie.durationMinutes);

        showtimes.push({
          id: `show-${showtimeIdCounter++}`,
          movieId: movie.id,
          screenId: screen.id,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          experienceFormat: screen.formatType,
          priceStandard: "15.00",
          priceVip: "22.50",
          priceAccessible: "12.00",
          movieTitle: movie.title,
          moviePoster: movie.posterUrl,
          cinemaName: cinema.name,
          cinemaAddress: cinema.address,
          cinemaCity: cinema.city,
          screenName: screen.name,
        });
      });
    });
  }

  return showtimes;
}
