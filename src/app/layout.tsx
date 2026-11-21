import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { Navbar } from "../components/site/navbar";
import { SiteFooter } from "../components/site/site-footer";
import "./globals.css";

const displayFont = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-family",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-family",
});

export const metadata: Metadata = {
  title: "FS Studio | Interior Architecture",
  description: "A considered interior design studio storefront.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <Navbar />
        <div className="site-navbar-offset">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
