import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function avatarAltName(name: string) {
  return name
    ?.split(" ")
    .map((word: string) => word[0].toUpperCase())
    .join("");
}

export function formatPhoneNumber(phoneNumberString: string) {
  const cleaned = `${phoneNumberString}`.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumberString;
}

export function formatCurrency(amount: number) {
  return amount.toFixed(2);
}

export function formatDuration(duration?: number) {
  const durationHr = Math.floor((duration || 0) / 60);
  const durationMin = (duration || 0) % 60;
  const durationStr = duration
    ? durationHr > 0
      ? `${durationHr.toString().padStart(2, "0")}h ${durationMin.toString().padStart(2, "0")}m`
      : `${durationMin.toString().padStart(2, "0")}m`
    : "";
  return durationStr;
}

export function simulateDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
