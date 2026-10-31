import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const description =
  "Meet guitarists, drummers, vocalists and session players near you. Show your work, invite the right people and build a band that plays live.";

export const metadata: Metadata = {
  title: {
    default: "SoundCircle – Find your sound",
    template: "%s · SoundCircle",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "SoundCircle",
    title: "SoundCircle – Find your sound",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The init script sets `data-theme` before React hydrates, so the attribute legitimately differs from the server HTML.
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
