"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Ticket, Building2, ShieldAlert, LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { UserSession } from "@/types";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Movies", icon: Film },
    { href: "/cinemas", label: "Cinemas", icon: Building2 },
    { href: "/history", label: "My Tickets", icon: Ticket },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 text-zinc-950 font-bold stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
              Cine<span className="text-amber-400">Book</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 -mt-1">
              Premiere Tickets
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-800/90 text-amber-400 shadow-sm"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {mounted && user?.role === "admin" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/admin"
                  ? "bg-rose-950/70 text-rose-300 border border-rose-800/50"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Admin
            </Link>
          )}
        </nav>

        {/* User Account & Actions */}
        <div className="flex items-center gap-3">
          {mounted && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium text-zinc-200">{user.name}</span>
                {user.role === "admin" && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full font-bold uppercase">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <LogIn className="w-4 h-4 text-zinc-400" />
                <span>Log In</span>
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-rose-600 text-zinc-950 hover:opacity-90 shadow-md shadow-rose-950/30 transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-900 bg-zinc-950 px-2 py-2">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 text-xs font-medium ${
                isActive ? "text-amber-400" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {item.label}
            </Link>
          );
        })}
        {mounted && user?.role === "admin" && (
          <Link
            href="/admin"
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium ${
              pathname === "/admin" ? "text-rose-400" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4 mb-0.5 text-rose-400" />
            Admin
          </Link>
        )}
      </div>
    </header>
  );
}
