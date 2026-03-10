import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChordSheet Editor",
    short_name: "ChordSheet",
    description: "Create beautiful chord sheets for musicians",
    start_url: "/dashboard",
    display: "standalone",
    theme_color: "#09090b",
    background_color: "#09090b",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
