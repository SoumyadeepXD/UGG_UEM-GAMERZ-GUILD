import { z } from "zod";

/**
 * Strips HTML tags, script vectors, and dangerous characters from user input text.
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<[^>]+>/g, "") // strip remaining HTML tags
    .replace(/javascript:/gi, "")
    .replace(/data:\s*text\/html/gi, "")
    .trim();
}

/**
 * Validates that a string is a well-formed HTTPS URL.
 */
const httpsUrlSchema = z
  .string()
  .trim()
  .url({ message: "Must be a valid URL" })
  .refine((url) => url.startsWith("https://"), {
    message: "URL must strictly use HTTPS protocol",
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
    .transform(sanitizeText),
  game: z
    .string()
    .trim()
    .min(2, { message: "Game name must be at least 2 characters" })
    .max(50, { message: "Game name cannot exceed 50 characters" })
    .transform(sanitizeText),
  posterUrl: httpsUrlSchema,
  date: z
    .string()
    .trim()
    .min(3, { message: "Date must be at least 3 characters" })
    .max(60, { message: "Date cannot exceed 60 characters" })
    .transform(sanitizeText),
  time: z
    .string()
    .trim()
    .max(40, { message: "Time cannot exceed 40 characters" })
    .transform(sanitizeText)
    .optional()
    .default("6:00 PM IST"),
  prizePool: z
    .string()
    .trim()
    .max(60, { message: "Prize pool cannot exceed 60 characters" })
    .transform(sanitizeText)
    .optional()
    .default("Trophies & Glory"),
  format: z
    .string()
    .trim()
    .max(60, { message: "Format cannot exceed 60 characters" })
    .transform(sanitizeText)
    .optional()
    .default("Open Bracket"),
  platform: z
    .string()
    .trim()
    .max(50, { message: "Platform cannot exceed 50 characters" })
    .transform(sanitizeText)
    .optional()
    .default("Cross-Platform"),
  entryFee: z
    .string()
    .trim()
    .max(40, { message: "Entry fee cannot exceed 40 characters" })
    .transform(sanitizeText)
    .optional()
    .default("Free"),
  description: z
    .string()
    .trim()
    .max(1000, { message: "Description cannot exceed 1,000 characters" })
    .transform(sanitizeText)
    .optional()
    .default(""),
  formUrl: httpsUrlSchema,
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
