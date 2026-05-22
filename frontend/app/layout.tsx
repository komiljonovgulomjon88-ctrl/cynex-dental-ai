import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Cynex Dental AI — Tish Sog'ligi Yordamchisi",
  description:
    "AI yordamida tish rasmini tahlil qiling. Kariyes, milki kasalligi, tish joylashuvi va boshqa muammolarni aniqlang. O'zbek tilida shaxsiy maslahat oling.",
  keywords: [
    "tish tahlili",
    "dental AI",
    "kariyes aniqlash",
    "tish sog'ligi",
    "stomatolog",
    "o'zbek dental",
    "AI stomatolog",
    "tish rasmi tahlil",
    "Cynex Dental",
  ],
  authors: [{ name: "Cynex Dental AI" }],
  creator: "Cynex Dental AI",
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    title: "Cynex Dental AI — Tish Sog'ligi Yordamchisi",
    description:
      "AI yordamida tish rasmini tahlil qiling va shaxsiy maslahat oling. O'zbek tilida ishlaydi.",
    siteName: "Cynex Dental AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cynex Dental AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cynex Dental AI — Tish Sog'ligi Yordamchisi",
    description: "AI yordamida tish rasmini tahlil qiling. O'zbek tilida.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "#f9fafb",
              border: "1px solid #374151",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
