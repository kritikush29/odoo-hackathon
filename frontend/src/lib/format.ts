/**
 * BRIGHTLOOP formatting utilities.
 * Centralizes all INR, date, and number formatting.
 */

/** Format a number as INR currency (₹) with en-IN locale */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a date to Indian locale */
export function formatDate(
  date: string | Date,
  style: "short" | "medium" | "long" = "medium"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions =
    style === "short"
      ? { day: "2-digit", month: "short" }
      : style === "medium"
        ? { day: "2-digit", month: "short", year: "numeric" }
        : { day: "2-digit", month: "long", year: "numeric" };
  return d.toLocaleDateString("en-IN", options);
}

/** Format a relative time (e.g. "3 days ago") */
export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(d, "medium");
}

/** Format subscription number: SUB-0001 */
export function formatSubNumber(n: number | string): string {
  const num = typeof n === "string" ? n : `SUB-${String(n).padStart(4, "0")}`;
  return num;
}

/** Format invoice number: INV-0001 */
export function formatInvNumber(n: number | string): string {
  const num = typeof n === "string" ? n : `INV-${String(n).padStart(4, "0")}`;
  return num;
}

/** Calculate days overdue from a due date. Returns 0 if not overdue. */
export function daysOverdue(dueDate: string | Date): number {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, diff);
}

/** Capitalize first letter, lowercase rest */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Merge class names, filtering falsy values */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Status type for chips and colors */
export type StatusType =
  | "active"
  | "confirmed"
  | "draft"
  | "paused"
  | "overdue";

/** Map a status string to a StatusType for chip colors */
export function getStatusType(status: string): StatusType {
  const map: Record<string, StatusType> = {
    Active: "active",
    Paid: "active",
    Confirmed: "confirmed",
    Quotation: "confirmed",
    Draft: "draft",
    Closed: "draft",
    Paused: "paused",
    Warning: "paused",
    Overdue: "overdue",
    Error: "overdue",
  };
  return map[status] || "draft";
}
