import type { Metadata, Viewport } from "next";
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
    "Taller mecánico y repuestos en un solo lugar. Cotiza al instante por WhatsApp. Agenda mantenimientos, diagnósticos y reparaciones sin perder tiempo. Consulta disponibilidad y precios en minutos, directo desde tu celular.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
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
      <body className="min-h-full overflow-x-hidden flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <FloatingWhatsApp />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
