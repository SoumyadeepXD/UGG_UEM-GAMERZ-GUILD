import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UGG - UEMK Gamerz Guild",
    short_name: "UGG",
    description: "The Official Esports & Gaming Guild of UEM Kolkata",
    start_url: "/",
    display: "standalone",
    background_color: "#060709",
    theme_color: "#060709",
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
