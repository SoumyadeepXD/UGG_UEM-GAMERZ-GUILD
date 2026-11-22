import React from "react";
import UggApp from "@/components/ugg/UggApp";
import { getPublishedTournaments } from "@/lib/events";
import { getSiteContent } from "@/lib/siteContent";

/**
 * Baseline ISR configuration:
 * Statically pre-rendered at build time. On-demand revalidation is triggered
 * whenever an admin modifies tournaments or site content (via revalidatePath('/')).
 * Zero database queries occur per public request.
 */
export const revalidate = 86400;

export default async function Home() {
  const [tournaments, siteContent] = await Promise.all([
    getPublishedTournaments(),
    getSiteContent(),
  ]);

  return <UggApp initialTournaments={tournaments} initialContent={siteContent} />;
}
