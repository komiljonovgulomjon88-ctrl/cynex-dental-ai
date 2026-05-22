"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ScanLine, LayoutDashboard, Bell, Trophy, LogOut, User, Menu, X
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Bosh Sahifa", icon: LayoutDashboard },
  { href: "/scan",       label: "Skan",        icon: ScanLine        },
  { href: "/reminders",  label: "Eslatmalar",  icon: Bell            },
  { href: "/kids",       label: "Bolalar",     icon: Trophy          },
];

export default function AppNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
    toast.success("Tizimdan chiqildi.");
  };

  return (
    <>
      <nav className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              <span className="text-white">Cynex</span>{" "}
              <span className="text-gradient">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-brand-900/40 text-brand-400"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Profile button */}
            <Link
              href="/profile"
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                pathname.startsWith("/profile")
                  ? "bg-brand-900/40 text-brand-400"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              <div className="w-6 h-6 bg-brand-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden lg:block">{user?.full_name?.split(" ")[0]}</span>
            </Link>
            <button
              onClick={handleLogout}
              title="Chiqish"
              className="hidden sm:flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950 px-6 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname.startsWith(item.href)
                    ? "bg-brand-900/40 text-brand-400"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800"
            >
              <User className="w-4 h-4" /> Profilim
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-gray-800 w-full"
            >
              <LogOut className="w-4 h-4" /> Tizimdan Chiqish
            </button>
          </div>
        )}
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
                active ? "text-brand-400" : "text-gray-600 hover:text-gray-300"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/profile"
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
            pathname.startsWith("/profile") ? "text-brand-400" : "text-gray-600 hover:text-gray-300"
          }`}
        >
          <User className="w-5 h-5" />
          Profil
        </Link>
      </div>
    </>
  );
}
