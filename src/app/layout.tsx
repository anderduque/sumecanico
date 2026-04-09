import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/cart/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sumecánico | Taller y Repuestos",
    template: "%s | Sumecánico",
  },
  description:
    "Servicios de mecánica automotriz y venta de repuestos. Cotiza por WhatsApp y agenda tu visita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <FloatingWhatsApp />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
