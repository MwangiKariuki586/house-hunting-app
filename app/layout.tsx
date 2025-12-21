// Root layout for VerifiedNyumba
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VerifiedNyumba - Find Your Dream Home in Kenya",
  description:
    "Kenya's trusted platform for finding verified rental properties directly from landlords. No agents, no surprises, just homes.",
  keywords: [
    "Kenya rentals",
    "Nairobi apartments",
    "house hunting Kenya",
    "verified landlords",
    "rental properties",
    "bedsitter",
    "apartment for rent",
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
