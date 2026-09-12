import Link from "next/link";
import { Film, Heart, ShieldCheck, HelpCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center">
                <Film className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Cine<span className="text-amber-400">Book</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your premiere cinema booking platform. Seamless real-time seat reservation, crystal-clear digital passes, and instant check-in.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Cinemas</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/cinemas" className="hover:text-white transition-colors">Grand IMAX Cinema</Link></li>
              <li><Link href="/cinemas" className="hover:text-white transition-colors">Premiere Lux & 4DX</Link></li>
              <li><Link href="/cinemas" className="hover:text-white transition-colors">Starlight Harbor</Link></li>
              <li><Link href="/cinemas" className="hover:text-white transition-colors">View All Theaters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Experiences</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> IMAX with Laser</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Dolby Atmos Cinema</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 4DX Dynamic Motion</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> VIP Recliner Suites</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Security & Trust</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                PCI-DSS Compliant Test Payments
              </p>
              <p className="flex items-center gap-1.5 text-zinc-300">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Instant 2-hour Pre-Show Cancellation
              </p>
              <p className="text-[11px] text-zinc-500 pt-2">
                Connected with Neon Serverless Postgres on Vercel.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500">
          <p>© 2025 CineBook Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for cinema lovers everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
