"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/discovery", label: "Discover" },
  { href: "/saved", label: "Saved" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsOpen(false);
    router.replace("/login");
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-gray-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="text-lg font-bold tracking-tight text-white sm:text-xl"
        >
          <span className="flex items-center gap-2">
            <span>
              DevScout <span className="text-blue-400">AI</span>
            </span>

            <Image
              src="/icon.png"
              alt="DevScout AI"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-500/15 text-blue-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            Logout
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <span className="text-2xl">✕</span>
          ) : (
            <span className="text-2xl">☰</span>
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {isOpen && (
        <nav className="border-t border-white/10 bg-gray-950 px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-500/15 text-blue-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
