"use server";

import { parsePhoneNumberFromString } from "libphonenumber-js";
import { registrationSchema } from "@anc/shared";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type RegisterState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function registerMember(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // Honeypot: real users never fill this hidden field. Bots that fill every
  // field on a form usually do.
  if (formData.get("company_website")) {
    return { status: "success" }; // pretend success, don't tip off the bot
  }

  const rawPhone = String(formData.get("whatsappNumber") ?? "");
  const parsedPhone = parsePhoneNumberFromString(rawPhone, "NG");

  const parsed = registrationSchema.safeParse({
    fullName: formData.get("fullName"),
    whatsappNumber: parsedPhone?.isValid() ? parsedPhone.number : rawPhone,
    email: formData.get("email"),
    birthdayDay: Number(formData.get("birthdayDay")),
    birthdayMonth: Number(formData.get("birthdayMonth")),
    stateOfOrigin: formData.get("stateOfOrigin") || undefined,
    stateOfResidence: formData.get("stateOfResidence"),
    favoritePlayerCurrent: formData.get("favoritePlayerCurrent") || undefined,
    favoritePlayerAlltime: formData.get("favoritePlayerAlltime") || undefined,
    jerseySize: formData.get("jerseySize") || undefined,
    selfReportedTier: formData.get("selfReportedTier") || undefined,
    consentGiven: formData.get("consentGiven") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  if (!parsedPhone?.isValid()) {
    return {
      status: "error",
      message: "That doesn't look like a valid WhatsApp number.",
      fieldErrors: { whatsappNumber: "Enter a valid Nigerian or international number." },
    };
  }

  const supabase = createServiceRoleClient();
  const { fullName, whatsappNumber, email, birthdayDay, birthdayMonth, ...rest } = parsed.data;

  const { error } = await supabase.from("members").insert({
    full_name: fullName,
    whatsapp_number: whatsappNumber,
    email,
    birthday_day: birthdayDay,
    birthday_month: birthdayMonth,
    state_of_origin: rest.stateOfOrigin ?? null,
    state_of_residence: rest.stateOfResidence,
    favorite_player_current: rest.favoritePlayerCurrent ?? null,
    favorite_player_alltime: rest.favoritePlayerAlltime ?? null,
    jersey_size: rest.jerseySize ?? null,
    self_reported_tier: rest.selfReportedTier ?? null,
    consent_given_at: new Date().toISOString(),
  });

  if (error) {
    // 23505 = unique_violation (duplicate email or WhatsApp number)
    if (error.code === "23505") {
      return {
        status: "error",
        message: "That email or WhatsApp number is already registered.",
      };
    }
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  return {
    status: "success",
    message: "You're in! An admin will review your registration shortly.",
  };
}
