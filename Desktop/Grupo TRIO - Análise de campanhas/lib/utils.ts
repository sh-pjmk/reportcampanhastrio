import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Contact, CampaignMetrics } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateMetrics(contacts: Contact[]): CampaignMetrics {
  const total = contacts.length;
  const read = contacts.filter((c) => c.status === "Read").length;
  const delivered = contacts.filter(
    (c) => c.status === "Delivered" || c.status === "Read"
  ).length;
  const sent = contacts.length;
  const failed = contacts.filter((c) => c.status === "Failed").length;
  const pending = contacts.filter((c) => c.status === "Pending").length;
  const ignored = contacts.filter((c) => c.status === "Ignored").length;
  const replied = contacts.filter((c) => c.respondeu === true).length;
  const hasReplyData = contacts.some((c) => c.respondeu !== undefined);

  return {
    total,
    read,
    delivered,
    sent,
    failed,
    pending,
    ignored,
    readRate: total > 0 ? (read / total) * 100 : 0,
    replied,
    replyRate: total > 0 ? (replied / total) * 100 : 0,
    hasReplyData,
  };
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}
