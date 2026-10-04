import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

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
    <html lang="it" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col text-[#F5F5F5] selection:bg-[#FF4B1F]/30 selection:text-white">
        {/* Intestazione / Navbar Gyver */}
        <header className="sticky top-0 z-50 border-b border-[#292929]/70 bg-black/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <Image
                src="/gyver_logo.svg"
                alt="Gyver"
                width={105}
                height={32}
                priority
                className="h-6 sm:h-7 w-auto"
              />
            </Link>

            <span className="text-sm font-medium text-[#A6A6A6]">
              Annunci Delivery
            </span>
          </div>
        </header>

        {/* Main Content with subtle Technical CAD Grid */}
        <div className="flex-1 bg-technical-grid bg-fixed">
          {children}
        </div>

        {/* Technical Footer */}
        <footer className="border-t border-[#292929]/70 bg-transparent py-8 text-xs text-[#737373]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Image
                src="/gyver_logo.svg"
                alt="Gyver"
                width={80}
                height={24}
                className="h-4 w-auto opacity-80"
              />
              <span className="text-[#383842]">|</span>
              <div className="flex items-center gap-2 text-[#A6A6A6]">
                <span>Assessment</span>
                <span className="text-[#383842]">&bull;</span>
                <span className="text-[#F5F5F5] font-medium flex items-center gap-2">
                  <span>Mattia Piazzolla</span>
                  <video
                    src="/gifbase.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-7 h-7 rounded-full object-cover border border-[#383842] shadow-sm inline-block shrink-0"
                  />
                </span>
              </div>
            </div>

          </div>
        </footer>
      </body>
    </html>
  );
}
