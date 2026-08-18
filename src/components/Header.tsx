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
    { href: "/flights", label: t.navFlights },
    { href: "/hotels", label: t.navHotels },
    { href: "/packages", label: t.navPackages },
    { href: "/planner", label: t.navPlanner },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-sky-600">
          <span aria-hidden>✈️</span>
          <span>{t.appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-sky-100 text-sky-700"
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
                className="rounded-full bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
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
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              pathname.startsWith(link.href) ? "bg-sky-100 text-sky-700" : "text-slate-600"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
