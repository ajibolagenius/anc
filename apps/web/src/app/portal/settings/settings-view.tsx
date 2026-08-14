"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WarningCircleIcon } from "@phosphor-icons/react/ssr";
import { JERSEY_SIZES, NIGERIAN_STATES } from "@anc/shared";
import { Badge } from "@/components/ui/badge";
import { SegmentedPills } from "@/components/ui/segmented-pills";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { updateMyProfile, deleteMyAccount } from "./actions";

export type SettingsMemberData = {
  fullName: string;
  email: string;
  whatsappNumber: string;
  stateOfResidence: string;
  favoritePlayerCurrent: string | null;
  favoritePlayerAlltime: string | null;
  jerseySize: string | null;
  activityTier: string;
  createdAt: string;
};

export function SettingsView({ member }: { member: SettingsMemberData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const confirm = useConfirm();
  const showToast = useToast();
  const router = useRouter();

  const joinDate = new Date(member.createdAt).toLocaleDateString("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateMyProfile(formData);
    setPending(false);

    if (res.success) {
      setIsEditing(false);
      showToast("Profile updated successfully!");
      router.refresh();
    } else {
      showToast(res.error || "Failed to update profile", "error");
    }
  }

  async function handleDelete() {
    const ok = await confirm("delete-account");
    if (!ok) return;

    setDeleting(true);
    try {
      await deleteMyAccount();
      await createClient().auth.signOut();
      showToast("Your account has been deleted.");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setDeleting(false);
      const msg = err instanceof Error ? err.message : "Failed to delete account";
      showToast(msg, "error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSave} className="flex flex-col gap-8">
        {/* Personal Details */}
        <div className="rounded-2xl border border-surface-border bg-surface p-6 sm:p-7">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <h2 className="font-display text-lg tracking-wide text-foreground">PERSONAL</h2>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold uppercase tracking-wider text-arsenal-red-bright hover:underline"
            >
              {isEditing ? "Cancel" : "Edit Details"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Full Name</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{member.fullName}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Email Address</p>
              <p className="mt-1 text-sm font-medium text-foreground">{member.email}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">WhatsApp Number</p>
              <p className="mt-1 text-sm font-medium text-foreground">{member.whatsappNumber}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">State of Residence</p>
              {isEditing ? (
                <select
                  name="stateOfResidence"
                  defaultValue={member.stateOfResidence}
                  required
                  className="mt-1 h-[40px] w-full rounded-lg border border-surface-border bg-white/5 px-3 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s} className="bg-arsenal-navy-deep text-foreground">
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 text-sm font-medium text-foreground">{member.stateOfResidence}</p>
              )}
            </div>
          </div>
        </div>

        {/* Fan Profile */}
        <div className="rounded-2xl border border-surface-border bg-surface p-6 sm:p-7">
          <div className="border-b border-surface-border pb-4">
            <h2 className="font-display text-lg tracking-wide text-foreground">FAN PROFILE</h2>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Favourite Current Player</p>
              {isEditing ? (
                <input
                  name="favoritePlayerCurrent"
                  defaultValue={member.favoritePlayerCurrent || ""}
                  placeholder="e.g. Bukayo Saka"
                  className="mt-1 h-[40px] w-full rounded-lg border border-surface-border bg-white/5 px-3 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
                />
              ) : (
                <p className="mt-1 text-sm font-medium text-foreground">
                  {member.favoritePlayerCurrent || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Favourite All-time Player</p>
              {isEditing ? (
                <input
                  name="favoritePlayerAlltime"
                  defaultValue={member.favoritePlayerAlltime || ""}
                  placeholder="e.g. Thierry Henry"
                  className="mt-1 h-[40px] w-full rounded-lg border border-surface-border bg-white/5 px-3 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
                />
              ) : (
                <p className="mt-1 text-sm font-medium text-foreground">
                  {member.favoritePlayerAlltime || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">Jersey Size</p>
              {isEditing ? (
                <SegmentedPills
                  name="jerseySize"
                  defaultValue={member.jerseySize || "M"}
                  options={JERSEY_SIZES.map((size) => ({ value: size, label: size }))}
                />
              ) : (
                <p className="text-sm font-medium text-foreground">{member.jerseySize || "M"}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 border-t border-surface-border pt-4">
              <button
                type="submit"
                disabled={pending}
                className="flex h-11 items-center justify-center rounded-xl bg-arsenal-red px-6 text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Membership Info */}
      <div className="rounded-2xl border border-surface-border bg-surface p-6 sm:p-7">
        <div className="border-b border-surface-border pb-4">
          <h2 className="font-display text-lg tracking-wide text-foreground">MEMBERSHIP</h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Activity Tier</p>
            <div className="mt-1.5">
              <Badge tone={member.activityTier === "active" ? "red" : "blue"}>
                {member.activityTier.toUpperCase().replace("_", " ")}
              </Badge>
            </div>
            <p className="mt-1.5 text-[11px] text-muted">Tier is set by admins after review.</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Member Since</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{joinDate}</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-arsenal-red-bright/40 bg-arsenal-red-bright/5 p-6 sm:p-7">
        <div className="flex items-center gap-2 text-arsenal-red-bright">
          <WarningCircleIcon className="h-5 w-5" />
          <h2 className="font-display text-lg tracking-wide">DANGER ZONE</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Permanently delete your ANC registry record, Fan Pass, and history per our NDPR data deletion policy.
          This action cannot be undone.
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex h-10 items-center justify-center rounded-full bg-arsenal-red-bright px-6 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete My Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
