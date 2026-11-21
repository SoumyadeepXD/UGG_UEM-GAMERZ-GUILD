import React from "react";
import UggApp from "@/components/ugg/UggApp";
import { getPublishedTournaments } from "@/lib/events";

/**
 * Baseline ISR configuration:
 * Statically pre-rendered at build time. On-demand revalidation is triggered
 * whenever an admin modifies tournaments (via revalidatePath('/')).
 * Zero database queries occur per public request.
 */
export const revalidate = 86400;

export default async function Home() {
  const tournaments = await getPublishedTournaments();

  return <UggApp initialTournaments={tournaments} />;
}
