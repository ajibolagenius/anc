"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SegmentedPills } from "@/components/ui/segmented-pills";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Tabs, TabLink } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Toggle } from "@/components/ui/toggle";

export default function ComponentsShowcasePage() {
  const [jerseySize, setJerseySize] = useState("M");
  const [toggleState, setToggleState] = useState(true);
  const [checkboxState, setCheckboxState] = useState(true);

  const confirm = useConfirm();
  const showToast = useToast();

  async function handleTriggerConfirm() {
    const ok = await confirm("reject-member");
    if (ok) {
      showToast("Confirmed: Member rejected");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-arsenal-red selection:text-white">
      <div className="mx-auto max-w-[1100px] px-8 py-10 pb-28">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-foreground mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to app
        </Link>

        <h1 className="font-display text-4xl tracking-wide text-foreground">UI COMPONENTS</h1>
        <p className="mt-1 text-sm text-muted mb-10">
          The design system and shared component primitives powering every ANC screen.
        </p>

        {/* 1. COLORS */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">COLORS</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <div className="h-16 w-24 rounded-xl bg-arsenal-red shadow-md" />
              <p className="mt-1.5 text-xs font-medium text-foreground">Red</p>
              <p className="text-[11px] text-muted">#DB0007</p>
            </div>
            <div>
              <div className="h-16 w-24 rounded-xl bg-arsenal-red-bright shadow-md" />
              <p className="mt-1.5 text-xs font-medium text-foreground">Red Bright</p>
              <p className="text-[11px] text-muted">#FF1A24</p>
            </div>
            <div>
              <div className="h-16 w-24 rounded-xl bg-arsenal-gold shadow-md" />
              <p className="mt-1.5 text-xs font-medium text-foreground">Gold</p>
              <p className="text-[11px] text-muted">#9C824A</p>
            </div>
            <div>
              <div className="h-16 w-24 rounded-xl bg-arsenal-navy shadow-md" />
              <p className="mt-1.5 text-xs font-medium text-foreground">Navy</p>
              <p className="text-[11px] text-muted">#023474</p>
            </div>
            <div>
              <div className="h-16 w-24 rounded-xl border border-surface-border bg-arsenal-navy-deep shadow-md" />
              <p className="mt-1.5 text-xs font-medium text-foreground">Navy Deep</p>
              <p className="text-[11px] text-muted">#01142E</p>
            </div>
            <div>
              <div className="h-16 w-24 rounded-xl bg-whatsapp-green shadow-md" />
              <p className="mt-1.5 text-xs font-medium text-foreground">WhatsApp</p>
              <p className="text-[11px] text-muted">#25D366</p>
            </div>
          </div>
        </section>

        {/* 2. TYPOGRAPHY */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">TYPOGRAPHY</h2>
          <div className="flex flex-col gap-2.5 rounded-2xl border border-surface-border bg-surface p-6">
            <p className="font-display text-4xl tracking-wide text-foreground">BEBAS NEUE — DISPLAY</p>
            <p className="text-base font-bold text-foreground">Manrope Bold — Subheads &amp; Field Labels</p>
            <p className="text-sm text-muted">
              Manrope Regular — Body copy, sits comfortably at 13.5–15px on dark surfaces.
            </p>
          </div>
        </section>

        {/* 3. BUTTONS */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">BUTTONS</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost / text link</Button>
            <Button variant="primary" pending>
              Pending
            </Button>
          </div>
        </section>

        {/* 4. BADGES */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">BADGES</h2>
          <div className="flex flex-wrap gap-2.5">
            <Badge tone="gold">PENDING</Badge>
            <Badge tone="green">APPROVED / SENT</Badge>
            <Badge tone="red">REJECTED / FAILED</Badge>
            <Badge tone="blue">SEMI-ACTIVE</Badge>
            <Badge tone="neutral">SUSPENDED / NEUTRAL</Badge>
          </div>
        </section>

        {/* 5. CARDS & STAT TILES */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">CARDS &amp; STAT TILES</h2>
          <div className="flex flex-wrap gap-4">
            <Card className="w-[200px] p-5">
              <p className="text-xs uppercase tracking-wider text-muted">Total Members</p>
              <p className="mt-1.5 font-display text-3xl text-foreground">482</p>
            </Card>

            <Card highlight className="w-[260px] p-5">
              <h3 className="text-sm font-bold text-foreground">Highlighted Card</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Gold border marks a needs-attention state or priority spotlight.
              </p>
            </Card>
          </div>
        </section>

        {/* 6. FORM CONTROLS */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">FORM CONTROLS</h2>
          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="comp-text-input" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Text input
              </label>
              <input
                id="comp-text-input"
                placeholder="e.g. Bukayo Saka"
                className="h-11 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="comp-select" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Select
              </label>
              <Select id="comp-select" defaultValue="Lagos">
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Rivers">Rivers</option>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="comp-textarea" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Textarea
              </label>
              <Textarea id="comp-textarea" placeholder="Multi-line message content…" rows={3} />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                checked={checkboxState}
                onChange={(e) => setCheckboxState(e.target.checked)}
                label="Checkbox option"
              />
            </div>

            <div className="flex items-center gap-3">
              <Toggle
                checked={toggleState}
                onChange={(e) => setToggleState(e.target.checked)}
                label="Toggle switch"
              />
            </div>

            <div className="sm:col-span-2">
              <p className="mb-2 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Segmented Pills
              </p>
              <SegmentedPills
                value={jerseySize}
                onChange={setJerseySize}
                options={[
                  { value: "S", label: "S" },
                  { value: "M", label: "M" },
                  { value: "L", label: "L" },
                  { value: "XL", label: "XL" },
                  { value: "XXL", label: "XXL" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* 7. TABS */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">TABS</h2>
          <Tabs className="max-w-md">
            <TabLink href="#active" active>Active Tab</TabLink>
            <TabLink href="#inactive" active={false}>Inactive Tab</TabLink>
            <TabLink href="#third" active={false}>Third Tab</TabLink>
          </Tabs>
        </section>

        {/* 8. TABLE */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">TABLE</h2>
          <div className="max-w-xl overflow-hidden rounded-2xl border border-surface-border bg-surface">
            <Table>
              <TableHead>
                <TableHeaderCell>Member</TableHeaderCell>
                <TableHeaderCell>Chapter</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-foreground">Ifeoluwa Adebayo</TableCell>
                  <TableCell className="text-muted">Lagos</TableCell>
                  <TableCell><Badge tone="green">APPROVED</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">Tunde Bakare</TableCell>
                  <TableCell className="text-muted">Abuja</TableCell>
                  <TableCell><Badge tone="gold">PENDING</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        {/* 9. PAGINATION */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">PAGINATION</h2>
          <Pagination
            currentPage={1}
            totalPages={3}
            makeHref={(page) => `#page-${page}`}
          />
        </section>

        {/* 10. SKELETON & EMPTY STATE */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">SKELETON &amp; EMPTY STATE</h2>
          <div className="flex flex-wrap items-start gap-6">
            <div className="w-56 space-y-2.5">
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-5/6 rounded-md" />
            </div>

            <EmptyState
              title="No entries yet"
              description="They'll show up here once submitted."
            />
          </div>
        </section>

        {/* 11. OVERLAYS DEMO: MODAL & TOAST */}
        <section className="mb-10">
          <h2 className="font-display text-lg tracking-wider text-arsenal-gold mb-3">OVERLAYS &amp; INTERACTIVE DEMOS</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="danger" onClick={handleTriggerConfirm}>
              Open Confirm Dialog
            </Button>
            <Button
              variant="secondary"
              onClick={() => showToast("Approved successfully!")}
            >
              Show Success Toast
            </Button>
            <Button
              variant="ghost"
              onClick={() => showToast("Something went wrong with the connection", "error")}
            >
              Show Error Toast
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
