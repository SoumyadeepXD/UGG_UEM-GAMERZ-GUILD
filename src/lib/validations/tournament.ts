import { z } from "zod";
import { isAllowlistedPosterUrl, isValidRegistrationUrl } from "./urlAllowlist";

/**
 * Trims input text without destructive regex replacements.
 * Length limits are enforced by Zod and output is safely rendered via React JSX text nodes.
 */
export function trimText(input: string): string {
  if (!input) return "";
  return input.trim();
}

/**
 * Validates that a string is a well-formed HTTPS registration URL.
 */
const registrationUrlSchema = z
  .string()
  .trim()
  .url({ message: "Registration link must be a valid URL" })
  .refine((url) => isValidRegistrationUrl(url), {
    message: "Registration URL must strictly use HTTPS protocol",
  });

/**
 * Validates that a string is an approved poster CDN URL.
 */
const posterUrlSchema = z
  .string()
  .trim()
  .url({ message: "Poster must be a valid URL" })
  .refine((url) => isAllowlistedPosterUrl(url), {
    message: "Poster URL host is not in the approved CDN allowlist (authorized hosts: Supabase project CDN, images.unsplash.com)",
  });

export const tournamentSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "ID must only contain alphanumeric characters, hyphens, and underscores",
    })
    .optional(),
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title cannot exceed 100 characters" })
    .transform(trimText),
  game: z
    .string()
    .trim()
    .min(2, { message: "Game name must be at least 2 characters" })
    .max(50, { message: "Game name cannot exceed 50 characters" })
    .transform(trimText),
  posterUrl: posterUrlSchema,
  date: z
    .string()
    .trim()
    .min(3, { message: "Date must be at least 3 characters" })
    .max(60, { message: "Date cannot exceed 60 characters" })
    .transform(trimText),
  time: z
    .string()
    .trim()
    .max(40, { message: "Time cannot exceed 40 characters" })
    .transform(trimText)
    .optional()
    .default("6:00 PM IST"),
  prizePool: z
    .string()
    .trim()
    .max(60, { message: "Prize pool cannot exceed 60 characters" })
    .transform(trimText)
    .optional()
    .default("Trophies & Glory"),
  format: z
    .string()
    .trim()
    .max(60, { message: "Format cannot exceed 60 characters" })
    .transform(trimText)
    .optional()
    .default("Open Bracket"),
  platform: z
    .string()
    .trim()
    .max(50, { message: "Platform cannot exceed 50 characters" })
    .transform(trimText)
    .optional()
    .default("Cross-Platform"),
  entryFee: z
    .string()
    .trim()
    .max(40, { message: "Entry fee cannot exceed 40 characters" })
    .transform(trimText)
    .optional()
    .default("Free"),
  description: z
    .string()
    .trim()
    .max(1000, { message: "Description cannot exceed 1,000 characters" })
    .transform(trimText)
    .optional()
    .default(""),
  formUrl: registrationUrlSchema,
  status: z.enum(["active", "upcoming", "completed"], {
    message: "Status must be active, upcoming, or completed",
  }),
  registeredTeams: z.number().int().nonnegative().optional(),
  maxTeams: z.number().int().positive().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["active", "upcoming", "completed"], {
    message: "Status must be active, upcoming, or completed",
  }),
});

export type TournamentInput = z.infer<typeof tournamentSchema>;
