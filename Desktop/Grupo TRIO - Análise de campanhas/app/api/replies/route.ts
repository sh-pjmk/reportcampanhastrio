// Required GHL token scopes: conversations.readonly  conversations/message.readonly
// If conversations/search returns empty for a valid contactId, check token scopes at:
// GHL → Settings → Integrations → API Keys

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutes for sequential processing of large contact lists

const GHL_BASE = "https://services.leadconnectorhq.com";

type ContactIdentifier = { contactId?: string; phone: string; sentAt?: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  headers: HeadersInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, { headers });

    if (res.status === 429) {
      const wait = 2000 * Math.pow(2, attempt); // 2s, 4s, 8s
      console.log(`[replies] 429 — aguardando ${wait}ms antes de retry (tentativa ${attempt + 1}/${maxRetries})...`);
      await sleep(wait);
      continue;
    }

    return res;
  }
  throw new Error(`[replies] Falha após ${maxRetries} tentativas (429)`);
}

type GHLMessage = Record<string, unknown>;

function normalizePhone(phone: string): string {
  return phone.replace(/^\+/, "").replace(/\s/g, "");
}

function isInbound(m: GHLMessage): boolean {
  return (
    m.direction === "inbound" ||
    m.type === 0 ||
    m.messageType === "TYPE_INCOMING_CALL"
  );
}

function isInboundAfterDate(m: GHLMessage, campaignDate?: Date): boolean {
  if (!isInbound(m)) return false;
  if (!campaignDate) return true;
  const raw = m.dateAdded || m.createdAt || 0;
  const msgDate = new Date(raw as string | number);
  return msgDate >= campaignDate;
}

function extractMessages(data: unknown): GHLMessage[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  const raw = d.messages;
  if (Array.isArray(raw)) return raw as GHLMessage[];
  if (raw && typeof raw === "object") {
    const nested = (raw as Record<string, unknown>).messages;
    if (Array.isArray(nested)) return nested as GHLMessage[];
  }
  return [];
}

// Fetches all message pages for a conversation, stopping early on first qualifying inbound hit.
async function getAllMessages(
  convId: string,
  headers: HeadersInit,
  campaignDate?: Date
): Promise<GHLMessage[]> {
  const all: GHLMessage[] = [];
  let lastMessageId: string | null = null;

  for (let page = 0; page < 10; page++) {
    const url = new URL(`${GHL_BASE}/conversations/${convId}/messages`);
    url.searchParams.set("limit", "100");
    if (lastMessageId) url.searchParams.set("lastMessageId", lastMessageId);

    const res = await fetchWithRetry(url.toString(), headers);
    if (!res.ok) {
      console.error(`[replies] messages HTTP ${res.status} conv=${convId} page=${page}`);
      break;
    }

    const data = await res.json();
    const msgs = extractMessages(data);

    console.log(`[replies]   messages page=${page} count=${msgs.length}`);
    all.push(...msgs);

    // Stop early if we already found a qualifying inbound message (after campaign date)
    if (msgs.some((m) => isInboundAfterDate(m, campaignDate))) break;

    const hasMore =
      msgs.length === 100 &&
      (data as Record<string, unknown>).nextPage != null;
    if (!hasMore) break;

    lastMessageId = (msgs[msgs.length - 1]?.id as string) ?? null;
    if (!lastMessageId) break;
  }

  return all;
}

async function checkContact(identifier: ContactIdentifier): Promise<boolean> {
  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!token || !locationId) {
    console.warn("[replies] GHL_API_TOKEN or GHL_LOCATION_ID not set");
    return false;
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };

  const contactId = identifier.contactId;

  try {
    // ── Step 1: resolve contactId ─────────────────────────────────────────────
    let ghlContactId: string;

    if (contactId) {
      ghlContactId = contactId;
    } else {
      const normalized = normalizePhone(identifier.phone);
      if (!normalized) return false;

      const contactRes = await fetchWithRetry(
        `${GHL_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(normalized)}&limit=1`,
        headers
      );

      if (!contactRes.ok) {
        console.error(`[replies] phone search HTTP ${contactRes.status} for ${normalized}`);
        return false;
      }

      const contactData = (await contactRes.json()) as {
        contacts?: Array<{ id: string }>;
      };

      const found = contactData.contacts?.[0];
      if (!found) return false;
      ghlContactId = found.id;
    }

    console.log(`[replies] contactId: ${ghlContactId}`);

    // ── Step 2: find up to 5 conversations for this contact ───────────────────
    const convRes = await fetchWithRetry(
      `${GHL_BASE}/conversations/search?locationId=${locationId}&contactId=${ghlContactId}&limit=5`,
      headers
    );

    if (!convRes.ok) {
      console.error(`[replies] conversation search HTTP ${convRes.status} for ${ghlContactId}`);
      return false;
    }

    const convData = (await convRes.json()) as {
      conversations?: Array<{ id: string }>;
    };

    const conversations = convData.conversations ?? [];
    console.log(`[replies] conversations found: ${conversations.length}`);

    // ── Step 3 (fallback): no conversation → check tag ───────────────────────
    if (conversations.length === 0) {
      const tagFallback = await checkReplyTag(ghlContactId, headers);
      console.log(`[replies] no conversation → tag fallback: ${tagFallback}`);
      return tagFallback;
    }

    // ── Step 4: check messages across all conversations ───────────────────────
    const campaignDate = identifier.sentAt ? new Date(identifier.sentAt) : undefined;

    for (const conv of conversations) {
      console.log(`[replies] conversationId: ${conv.id}`);

      const messages = await getAllMessages(conv.id, headers, campaignDate);
      const inboundAfterCampaign = messages.filter((m) =>
        isInboundAfterDate(m, campaignDate)
      ).length;

      console.log(`[replies] messages found: ${messages.length}`);
      console.log(`[replies] inbound after campaign date: ${inboundAfterCampaign}`);

      if (inboundAfterCampaign > 0) {
        console.log(`[replies] respondeu: true`);
        return true;
      }
    }

    console.log(`[replies] respondeu: false`);
    return false;
  } catch (err) {
    console.error(`[replies] exception for ${contactId ?? identifier.phone}:`, err);
    return false;
  }
}

async function checkReplyTag(
  contactId: string,
  headers: HeadersInit
): Promise<boolean> {
  try {
    const res = await fetchWithRetry(`${GHL_BASE}/contacts/${contactId}`, headers);
    if (!res.ok) return false;

    const data = (await res.json()) as {
      contact?: { tags?: string[] };
    };

    const tags = data.contact?.tags ?? [];
    return tags.some((t) => t.toLowerCase().includes("campanha respondida"));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      contacts?: unknown;
      phones?: unknown;
    };

    // Support both new { contacts: [] } and legacy { phones: [] }
    let identifiers: ContactIdentifier[] = [];

    if (Array.isArray(body.contacts)) {
      identifiers = body.contacts as ContactIdentifier[];
    } else if (Array.isArray(body.phones)) {
      identifiers = (body.phones as string[]).map((phone) => ({ phone }));
    }

    console.log(`[replies] checking ${identifiers.length} contact(s)`);

    if (identifiers.length === 0) {
      return NextResponse.json({ replies: {} });
    }

    const replies: Record<string, boolean> = {};

    for (const identifier of identifiers) {
      const key = identifier.contactId || identifier.phone;
      try {
        await sleep(300); // 300ms between each contact to avoid 429
        replies[key] = await checkContact(identifier);
      } catch (e) {
        console.error(`[replies] skipping ${key} due to error:`, e);
        replies[key] = false;
      }
    }

    const repliedCount = Object.values(replies).filter(Boolean).length;
    console.log(`[replies] done — ${repliedCount}/${identifiers.length} responderam`);
    return NextResponse.json({ replies });
  } catch (err) {
    console.error("[replies] unhandled error:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar a requisição" },
      { status: 500 }
    );
  }
}
