import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Office Oracle - Hitta ditt nästa kontor med full transparens",
  description: "Sluta gissa hyror. Få full transparens och smarta rekommendationer baserade på verklig data. Sök bland tusentals kontorslokaler i Sverige.",
  keywords: "kontorslokal, hyra kontor, kontorsuthyrning, Stockholm, Göteborg, Malmö, hyresindex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
