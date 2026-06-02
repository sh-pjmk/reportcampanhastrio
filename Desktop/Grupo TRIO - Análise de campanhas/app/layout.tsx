import type { Metadata } from "next";
import { Libre_Baskerville, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CampaignProvider } from "@/context/CampaignContext";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-baskerville",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grupo TRIO — Report de Campanhas WhatsApp",
  description:
    "Dashboard interno de análise de campanhas WhatsApp do Grupo TRIO.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${libreBaskerville.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans">
        <CampaignProvider>{children}</CampaignProvider>
      </body>
    </html>
  );
}
