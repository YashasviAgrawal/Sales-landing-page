import type { MetadataRoute } from "next";
import { brand } from "@/lib/content";

/*
  /manifest.webmanifest

  Modest but real value, and it costs one file. It gives Android Chrome a
  proper name, icon and theme colour when someone saves the site to their home
  screen, and it is one of the things Lighthouse's PWA and best-practices
  audits look for - which matters here only because those audits are what
  people run before deciding a site was built carefully.

  Deliberately NOT a full PWA: no service worker, no offline strategy, and
  `display: "browser"` rather than "standalone". A marketing site has nothing
  to cache offline, and a standalone window that hides the URL bar on a page
  whose whole job is to be shared is a loss, not a feature.
*/
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — Revenue Leak Audit`,
    short_name: brand.name,
    description:
      "Your revenue isn’t broken everywhere. It’s broken in one place. A free 45-minute audit names the leak.",
    start_url: "/",
    display: "browser",
    background_color: "#000000",
    /* Same ink as the viewport themeColor, so the browser chrome does not
       change colour between a normal tab and a saved one. */
    theme_color: "#000000",
    lang: "en-IN",
    categories: ["business", "consulting"],
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
