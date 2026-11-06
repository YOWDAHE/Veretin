import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geist = localFont({
  src: [
    { path: "./fonts/Geist-VariableFont_wght.ttf", weight: "100 900", style: "normal" },
    { path: "./fonts/Geist-Italic-VariableFont_wght.ttf", weight: "100 900", style: "italic" },
  ],
  variable: "--font-geist",
  display: "swap",
});

// Display font for the hero headline (Unbounded SemiBold, Google Fonts, OFL).
const unbounded = localFont({
  src: "./fonts/Unbounded-SemiBold.woff2",
  weight: "600",
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veretin — Speak your language. Send theirs.",
  description:
    "Talk in any app and Veretin types it, or says it, in the other person's language. In your own voice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${unbounded.variable}`}>
      <body>{children}</body>
    </html>
  );
}
