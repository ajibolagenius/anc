import { z } from "zod";
import { JERSEY_SIZES, NIGERIAN_STATES } from "./enums";

/**
 * Loose E.164-ish check at the schema layer. The registration form does the
 * real validation (and normalization) with libphonenumber-js before this
 * schema ever sees the value — this is a defense-in-depth backstop, not the
 * source of truth for phone validity.
 */
const whatsappNumberSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Enter a valid international number, e.g. +2348012345678");

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  whatsappNumber: whatsappNumberSchema,
  email: z.string().trim().toLowerCase().email(),
  birthdayDay: z.number().int().min(1).max(31),
  birthdayMonth: z.number().int().min(1).max(12),
  stateOfOrigin: z.enum(NIGERIAN_STATES).optional(),
  stateOfResidence: z.enum(NIGERIAN_STATES),
  favoritePlayerCurrent: z.string().trim().max(80).optional(),
  favoritePlayerAlltime: z.string().trim().max(80).optional(),
  jerseySize: z.enum(JERSEY_SIZES).optional(),
  selfReportedTier: z.enum(["active", "semi_active", "inactive"]).optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must consent to ANC storing your details to register" }),
  }),
});
export type RegistrationInput = z.infer<typeof registrationSchema>;

export const giveawayEntrySchema = z.object({
  giveawayId: z.string().uuid(),
});
export type GiveawayEntryInput = z.infer<typeof giveawayEntrySchema>;

export const predictionSchema = z.object({
  matchId: z.string().uuid(),
  predictedHomeScore: z.number().int().min(0).max(20),
  predictedAwayScore: z.number().int().min(0).max(20),
  predictedFirstScorer: z.string().trim().max(80).optional(),
});
export type PredictionInput = z.infer<typeof predictionSchema>;

export const watchPartySubmissionSchema = z.object({
  matchId: z.string().uuid().optional(),
  state: z.enum(NIGERIAN_STATES),
  city: z.string().trim().min(2).max(80),
  venueName: z.string().trim().min(2).max(120),
  address: z.string().trim().max(240).optional(),
  mapLink: z
    .string()
    .trim()
    .url()
    .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
      message: "Map link must be a regular http(s) URL",
    })
    .optional(),
  contactName: z.string().trim().max(80).optional(),
  contactWhatsapp: whatsappNumberSchema.optional(),
  isRecurring: z.boolean().default(false),
});
export type WatchPartySubmissionInput = z.infer<typeof watchPartySubmissionSchema>;

export const profileUpdateSchema = z.object({
  jerseySize: z.enum(JERSEY_SIZES).optional(),
  favoritePlayerCurrent: z.string().trim().max(80).optional(),
  favoritePlayerAlltime: z.string().trim().max(80).optional(),
  stateOfResidence: z.enum(NIGERIAN_STATES),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
