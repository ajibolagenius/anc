"use client";

import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon, CakeIcon } from "@phosphor-icons/react/ssr";

type MemberBirthday = {
  id: string;
  fullName: string;
  birthdayDay: number;
  birthdayMonth: number;
  stateOfResidence: string;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function BirthdayCalendar({ members }: { members: MemberBirthday[] }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  // Calculate calendar grid days
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Group members with birthdays in currentMonth (1-indexed in DB)
  const birthdaysByDay = new Map<number, MemberBirthday[]>();
  for (const m of members) {
    if (m.birthdayMonth === currentMonth + 1) {
      const existing = birthdaysByDay.get(m.birthdayDay) ?? [];
      existing.push(m);
      birthdaysByDay.set(m.birthdayDay, existing);
    }
  }

  const cells = [];
  // Empty leading days
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ type: "empty" as const, key: `empty-${i}` });
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const list = birthdaysByDay.get(day) ?? [];
    const isToday =
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear;

    cells.push({
      type: "day" as const,
      day,
      birthdays: list,
      isToday,
      key: `day-${day}`,
    });
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 sm:p-7 shadow-xl">
      {/* Month Switcher */}
      <div className="flex items-center justify-between border-b border-surface-border pb-5">
        <div className="flex items-center gap-2.5">
          <CakeIcon className="h-6 w-6 text-arsenal-gold" />
          <h2 className="font-display text-2xl tracking-wide text-foreground">
            {MONTH_NAMES[currentMonth].toUpperCase()} {currentYear}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-white/5 text-muted hover:text-white transition-colors"
            title="Previous Month"
          >
            <CaretLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-white/5 text-muted hover:text-white transition-colors"
            title="Next Month"
          >
            <CaretRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold tracking-wider text-muted">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar 7-Column Grid */}
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((cell) => {
          if (cell.type === "empty") {
            return <div key={cell.key} className="min-h-[75px] rounded-xl bg-white/[0.01]" />;
          }

          const hasBirthdays = cell.birthdays.length > 0;

          return (
            <div
              key={cell.key}
              className={`relative flex min-h-[85px] flex-col justify-between rounded-xl border p-2 text-xs transition-colors ${
                hasBirthdays
                  ? "border-arsenal-red/40 bg-arsenal-red/[0.08]"
                  : "border-surface-border bg-white/[0.02]"
              } ${cell.isToday ? "ring-1 ring-arsenal-gold" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold ${
                    cell.isToday
                      ? "rounded bg-arsenal-gold px-1 text-arsenal-navy-deep"
                      : hasBirthdays
                      ? "text-arsenal-red-bright"
                      : "text-muted"
                  }`}
                >
                  {cell.day}
                </span>
                {hasBirthdays && (
                  <CakeIcon className="h-3 w-3 text-arsenal-gold" />
                )}
              </div>

              {hasBirthdays && (
                <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
                  {cell.birthdays.map((b) => (
                    <p
                      key={b.id}
                      className="truncate text-[10px] font-bold text-arsenal-gold leading-tight"
                      title={`${b.fullName} (${b.stateOfResidence})`}
                    >
                      {b.fullName.split(" ")[0]}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
