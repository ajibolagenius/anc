import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/supabase/server-session";
import { createServiceRoleClient } from "@/lib/supabase/server";

function toCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

const COLUMNS = [
  "anc_number",
  "full_name",
  "whatsapp_number",
  "email",
  "state_of_residence",
  "state_of_origin",
  "jersey_size",
  "activity_tier",
  "registration_status",
  "birthday_day",
  "birthday_month",
  "created_at",
] as const;

export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") ?? "all";
  const tier = searchParams.get("tier") ?? "";
  const state = searchParams.get("state") ?? "";
  const q = searchParams.get("q") ?? "";

  const supabase = createServiceRoleClient();
  let query = supabase.from("members").select(COLUMNS.join(",")).order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("registration_status", status);
  if (tier) query = query.eq("activity_tier", tier);
  if (state) query = query.eq("state_of_residence", state);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,whatsapp_number.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as unknown as Record<(typeof COLUMNS)[number], unknown>[];
  const lines = [
    COLUMNS.join(","),
    ...rows.map((row) => COLUMNS.map((col) => toCsvValue(row[col])).join(",")),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="anc-members-${status}.csv"`,
    },
  });
}
