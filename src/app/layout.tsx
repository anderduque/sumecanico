import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { CartProvider } from "@/cart/CartProvider";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RoutePrefetch } from "@/components/RoutePrefetch";

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

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <CartProvider>
          <RoutePrefetch />
          <Header />

          <main className="flex-1 pb-24 md:pb-0">{children}</main>

          <FloatingWhatsApp />
          <Footer />
        </CartProvider>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18371472637"
          strategy="afterInteractive"
        />

        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            gtag("js", new Date());
            gtag("config", "AW-18371472637");
          `}
        </Script>
      </body>
    </html>
  );
}
