import "./globals.css";
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google";

const displayFont = Merriweather({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: {
    default: "UrbanKeys - Online Property Listing",
    template: "%s | UrbanKeys",
  },
  description: "Scalable full-stack property listing, inquiry, and admin management platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}
