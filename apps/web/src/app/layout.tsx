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
        {/* Technical Header / Navigation */}
        <header className="sticky top-0 z-50 border-b border-[#292929] bg-[#080808]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/"
                className="flex items-center transition-opacity hover:opacity-90"
              >
                <Image
                  src="/gyver_logo.svg"
                  alt="Gyver"
                  width={110}
                  height={34}
                  priority
                  className="h-7 w-auto"
                />
              </Link>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[#292929] bg-[#111111] text-[11px] font-mono text-[#A6A6A6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B1F] animate-pulse" />
                <span>DELIVERY SYSTEM</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden md:flex items-center gap-2 text-xs text-[#A6A6A6]">
                <span className="font-mono text-[#FF4B1F] font-semibold">
                  25.000+
                </span>
                <span>tecnici nella community</span>
              </div>

              <a
                href="https://gyver.work/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#292929] bg-[#111111] text-[#F5F5F5] hover:bg-[#181818] hover:border-[#383838] transition-colors"
              >
                gyver.work &rarr;
              </a>
            </div>
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
                className="h-4 w-auto opacity-70"
              />
              <span className="text-[#292929]">|</span>
              <span className="text-[#A6A6A6]">
                Il collega che si prende cura della tua carriera.
              </span>
            </div>
            <div className="flex items-center gap-4 text-[#737373]">
              <span>Industrial &bull; Technical &bull; Direct</span>
              <span>&copy; {new Date().getFullYear()} Gyver</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
