import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

// Using system fonts as fallback until Aljazeera font files are added
// To add Aljazeera font: Place font files in public/fonts/ directory
// and uncomment the localFont configuration below

/*
import localFont from "next/font/local";
const aljazeera = localFont({
  src: [
    {
      path: "../public/fonts/Aljazeera-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Aljazeera-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aljazeera",
  fallback: ["Arial", "sans-serif"],
});
*/

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OMIGEC - Ordre Mauritanien des Ingénieurs en Génie Civil",
  description: "Plateforme digitale de l'Ordre Mauritanien des Ingénieurs en Génie Civil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistMono.variable} antialiased font-sans`}
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
