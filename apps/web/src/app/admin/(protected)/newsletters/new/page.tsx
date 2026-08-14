import { ACTIVITY_TIERS, NIGERIAN_STATES } from "@anc/shared";
import { inputClassName } from "@/components/form-field";
import { createNewsletter } from "../actions";

export default function NewNewsletterPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-foreground">New newsletter</h1>
      <p className="mt-2 text-sm text-muted">
        Sends to approved members only. Written as plain text — it's wrapped in a simple branded
        template automatically, no HTML needed.
      </p>

      <form action={createNewsletter} className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/90">Subject</label>
          <input name="subject" required className={inputClassName} placeholder="This month at ANC" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/90">Body</label>
          <textarea
            name="bodyText"
            required
            rows={10}
            className={inputClassName}
            placeholder={"Hey Gunners,\n\nHere's what's happening this month..."}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/90">
              Tier <span className="text-xs font-normal text-muted">optional</span>
            </label>
            <select name="tier" defaultValue="" className={inputClassName}>
              <option value="">All approved members</option>
              {ACTIVITY_TIERS.filter((t) => t !== "pending").map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/90">
              State <span className="text-xs font-normal text-muted">optional</span>
            </label>
            <select name="state" defaultValue="" className={inputClassName}>
              <option value="">All states</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-surface-border p-4">
          <label className="flex items-center gap-2.5 text-sm text-foreground/90">
            <input type="checkbox" name="alsoPostToWhatsapp" className="h-4 w-4" />
            Also post a summary to the WhatsApp group
          </label>
          <textarea
            name="whatsappSummaryText"
            rows={2}
            className={`${inputClassName} mt-3`}
            placeholder="Short one-liner for the group (only used if the box above is checked)"
          />
        </div>

        <button
          type="submit"
          className="self-start rounded-full bg-arsenal-red px-6 py-3 text-sm font-medium text-white hover:scale-[1.02]"
        >
          Save as draft
        </button>
      </form>
    </div>
  );
}
