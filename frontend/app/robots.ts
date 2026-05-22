import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/auth"],
      disallow: ["/dashboard", "/scan", "/analysis", "/reminders", "/kids", "/profile", "/onboarding"],
    },
    sitemap: "https://cynex-dental.vercel.app/sitemap.xml",
  };
}
