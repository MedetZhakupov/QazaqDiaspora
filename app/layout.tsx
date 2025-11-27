import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Қазақ Диаспорасы - Іс-шаралар",
  description: "Қазақ диаспорасының іс-шараларын басқару платформасы",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
