import { getCinemas, getMovies } from "@/lib/data-store";
import Link from "next/link";
import { Building2, MapPin, Phone, Sparkles, Film } from "lucide-react";

export default async function CinemasPage() {
  const cinemas = await getCinemas();
  const movies = await getMovies();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-400 block mb-2">
          Experience Pure Cinema
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Our Flagship Theaters
        </h1>
        <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
          Featuring next-generation laser projection, immersive multi-dimensional Dolby Atmos audio, and luxury electric recliners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cinemas.map((cin) => (
          <div
            key={cin.id}
            className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl hover:border-zinc-700 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-950 relative">
                <img
                  src={cin.imageUrl}
                  alt={cin.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-4 px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md text-amber-400 font-bold text-xs border border-zinc-800">
                  {cin.city}, {cin.state}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {cin.name}
                </h3>

                <div className="space-y-1.5 text-xs text-zinc-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>{cin.address}</span>
                  </div>
                  {cin.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{cin.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800/60">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                    Amenities & Formats
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cin.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 text-[11px] font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                href={`/?cinema=${cin.id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Film className="w-3.5 h-3.5 text-amber-400" />
                View Showtimes at this Cinema
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
