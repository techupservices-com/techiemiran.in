import { createHash } from "crypto";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeMobile(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

export function formatMobile(value: string) {
  const mobile = normalizeMobile(value);
  if (mobile.length !== 10) return value;
  return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
