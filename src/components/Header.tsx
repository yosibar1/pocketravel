"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./LanguageProvider";

interface HeaderProps {
  googleConfigured: boolean;
  userName?: string | null;
  userImage?: string | null;
}

export function Header({ googleConfigured, userName, userImage }: HeaderProps) {
  const { t, toggleLang } = useLang();
  const pathname = usePathname();

  const links = [
    { href: "/", label: t.navDeals },
    { href: "/flights", label: t.navFlights },
    { href: "/hotels", label: t.navHotels },
    { href: "/planner", label: t.navPlanner },
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-neutral-900">
          <span aria-hidden>✈️</span>
          <span>
            Pocket
            <span className="text-neutral-500">
              Ravel
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? "bg-neutral-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            {t.langToggle}
          </button>
          {userName ? (
            <form action="/api/auth/signout" method="post" className="flex items-center gap-2">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={userName} className="h-8 w-8 rounded-full" />
              ) : null}
              <button
                type="submit"
                className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
              >
                {t.signOut}
              </button>
            </form>
          ) : googleConfigured ? (
            <form action="/api/auth/signin/google" method="post">
              <button
                type="submit"
                className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                {t.signIn}
              </button>
            </form>
          ) : (
            <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-500 sm:block">
              {t.guest}
            </span>
          )}
        </div>
      </div>

      <nav className="flex items-center justify-around border-t border-slate-100 py-1 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              isActive(link.href) ? "bg-neutral-900 text-white" : "text-slate-600"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
