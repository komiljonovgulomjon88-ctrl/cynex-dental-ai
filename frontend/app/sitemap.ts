import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cynex-dental.vercel.app";
  return [
    { url: base,              lastModified: new Date(), changeFrequency: "monthly",  priority: 1.0 },
    { url: `${base}/auth`,    lastModified: new Date(), changeFrequency: "yearly",   priority: 0.5 },
  ];
}
