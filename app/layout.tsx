import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body
        className={`${geistMono.variable} antialiased font-body`}
        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', Arial, sans-serif" }}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
