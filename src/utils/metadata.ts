import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: "https://courseforge.ai",
      siteName: "CourseForge Video Editor",
      ...override.openGraph
    },
    twitter: {
      card: "summary_large_image",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      ...override.twitter
    },
    icons: {
      icon: "/icon.svg"
    }
  };
}

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? new URL("http://localhost:4000")
    : new URL("https://courseforge.ai");
