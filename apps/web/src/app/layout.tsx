import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gyver — Il punto di riferimento per la carriera dei tecnici",
  description:
    "Piattaforma e community verticale per tecnici elettrici, elettromeccanici, elettronici e manutentori.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-[#F5F5F5] selection:bg-[#FF4B1F]/30 selection:text-white">
        {/* Gyver Header / Navigation aligned to gyver.work */}
        <header className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-90"
            >
              <Image
                src="/gyver_logo.svg"
                alt="Gyver"
                width={100}
                height={30}
                priority
                className="h-6 sm:h-7 w-auto"
              />
            </Link>

            <nav className="flex items-center gap-3 sm:gap-7">
              <span className="px-4 py-2 rounded-full border border-[#292929] bg-[#141417] text-white text-xs sm:text-sm font-medium tracking-tight">
                Per tecnici elettrici
              </span>

              <a
                href="https://gyver.work/companies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-[#A6A6A6] hover:text-white transition-colors"
              >
                Per aziende
              </a>

              <a
                href="https://gyver.work/join"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-[#A6A6A6] hover:text-white transition-colors hidden sm:inline-block"
              >
                Careers
              </a>

              <a
                href="https://gyver.work/contattaci"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-[#A6A6A6] hover:text-white transition-colors hidden sm:inline-block"
              >
                Contattaci
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content with subtle Technical CAD Grid */}
        <div className="flex-1 bg-technical-grid bg-fixed">
          {children}
        </div>

        {/* Technical Footer */}
        <footer className="border-t border-[#292929] bg-[#0D0D0D] py-8 text-xs text-[#737373]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/gyver_logo.svg"
                alt="Gyver"
                width={80}
                height={24}
                className="h-4 w-auto opacity-80"
              />
              <span className="text-[#292929]">|</span>
              <span className="text-[#A6A6A6]">
                Gyver &mdash; Il collega che si prende cura della tua carriera.
              </span>
            </div>
            <div className="flex items-center gap-4 text-[#737373]">
              <span>Sempre al tuo fianco su WhatsApp</span>
              <span>&copy; {new Date().getFullYear()} Gyver</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
