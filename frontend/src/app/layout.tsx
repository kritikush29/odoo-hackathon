import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brightloop — Subscription Management & Recurring Billing",
  description:
    "Unified subscription management and recurring billing platform for Indian software businesses. GST-compliant, automated billing cycles, and real-time revenue analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${ibmMono.variable}`}
    >
      <body className="bg-paper text-ink font-sans min-h-screen selection:bg-sand selection:text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
