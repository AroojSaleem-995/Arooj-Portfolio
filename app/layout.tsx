import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://aroojsaleem-995.github.io"),
  title: {
    default: "Arooj Saleem | AI & Machine Learning Portfolio",
    template: "%s | Arooj Saleem",
  },
  description:
    "Explore Arooj Saleem's portfolio featuring AI and machine learning projects, technical skills, and software engineering experience.",
  keywords: [
    "Arooj Saleem",
    "AI",
    "Machine Learning",
    "Artificial Intelligence",
    "Software Engineering",
    "ML Projects",
  ],
  authors: [{ name: "Arooj Saleem" }],
  openGraph: {
    title: "Arooj Saleem | AI & Machine Learning Portfolio",
    description:
      "AI/ML projects, technical skills, and software engineering work by Arooj Saleem.",
    type: "website",
    url: "https://aroojsaleem-995.github.io/AroojSaleem_Portfolio/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
