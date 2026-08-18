import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
});
import { LanguageProvider } from "@/components/LanguageProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth, googleConfigured } from "@/auth";

export const metadata: Metadata = {
  title: "PocketRavel — Find. Plan. Fly.",
  description:
    "Flights, hotels and vacation packages with a smart trip planner — all in one place.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = googleConfigured ? await auth() : null;

  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-slate-900">
        {/* Travelpayouts Drive — affiliate script, installed at the owner's request.
            An async external script is hoisted by React into the document head. */}
        <script async data-cmp-ab="2" src="https://emrldtp.cc/NTYzNzkz.js?t=563793" />
        <LanguageProvider>
          <Header
            googleConfigured={googleConfigured}
            userName={session?.user?.name}
            userImage={session?.user?.image}
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
