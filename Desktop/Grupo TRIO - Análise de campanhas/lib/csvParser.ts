import { Campaign, Contact, ContactStatus, ALL_STATUSES } from "@/types";

// Parses the entire CSV content respecting quoted fields that span multiple lines.
function parseRecords(content: string, sep: string): string[][] {
  const records: string[][] = [];
  let fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          // Escaped double-quote inside quoted field
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else if (ch !== "\r") {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === sep) {
        fields.push(current.trim());
        current = "";
      } else if (ch === "\n") {
        fields.push(current.trim());
        if (fields.some((f) => f !== "")) {
          records.push(fields);
        }
        fields = [];
        current = "";
      } else if (ch !== "\r") {
        current += ch;
      }
    }
  }

  // Flush last record
  fields.push(current.trim());
  if (fields.some((f) => f !== "")) {
    records.push(fields);
  }

  return records;
}

function detectSeparator(headerLine: string): string {
  const semicolons = (headerLine.match(/;/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

function nameFromFileName(fileName: string): string {
  return fileName
    .replace(/\.csv$/i, "")
    .replace(/[_]/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ")
    .trim();
}

function inferStatus(message: string): ContactStatus {
  if (!message.trim()) return "Sent";
  const m = message.toLowerCase();
  if (m.includes("insufficient funds")) return "Failed";
  if (m.includes("undeliverable")) return "Failed";
  if (m.includes("not a whatsapp")) return "Failed";
  if (m.includes("ecosystem engagement")) return "Failed";
  if (m.includes("experiment")) return "Failed";
  return "Failed";
}

function extractFailureReason(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("insufficient funds")) return "Saldo insuficiente";
  if (m.includes("not a whatsapp")) return "Não é WhatsApp";
  if (m.includes("ecosystem engagement")) return "Bloqueado pelo Meta";
  if (m.includes("experiment")) return "Experimento Meta";
  if (m.includes("undeliverable")) return "Não entregável";
  return "Falha desconhecida";
}

const STATUS_PRIORITY: Record<ContactStatus, number> = {
  Read: 6,
  Delivered: 5,
  Sent: 4,
  Pending: 3,
  Ignored: 2,
  Failed: 1,
};

function deduplicateContacts(contacts: Contact[]): Contact[] {
  const map = new Map<string, Contact>();
  for (const c of contacts) {
    const key = c.contactId || c.telefone;
    if (!key) continue;
    const existing = map.get(key);
    if (
      !existing ||
      STATUS_PRIORITY[c.status] > STATUS_PRIORITY[existing.status]
    ) {
      map.set(key, c);
    }
  }
  return Array.from(map.values());
}

export function parseCSV(content: string, fileName: string): Campaign {
  const clean = content.replace(/^﻿/, "");

  const firstNewline = clean.indexOf("\n");
  if (firstNewline < 0) {
    return {
      id: `${fileName}-${Date.now()}`,
      name: nameFromFileName(fileName),
      fileName,
      contacts: [],
      uploadedAt: new Date(),
    };
  }

  const headerLine = clean.slice(0, firstNewline).replace(/\r$/, "");
  const sep = detectSeparator(headerLine);
  const records = parseRecords(clean, sep);

  if (records.length < 2) {
    return {
      id: `${fileName}-${Date.now()}`,
      name: nameFromFileName(fileName),
      fileName,
      contacts: [],
      uploadedAt: new Date(),
    };
  }

  const headers = records[0].map((h) =>
    h
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
  );

  const isGHLBulkFormat =
    headers.includes("id") && headers.includes("message");

  const contacts: Contact[] = [];

  if (isGHLBulkFormat) {
    const idx = {
      id: headers.indexOf("id"),
      name: headers.indexOf("name"),
      phone: headers.indexOf("phone"),
      status: headers.indexOf("status"),
      message: headers.indexOf("message"),
      timestamp: headers.findIndex(
        (h) =>
          h.includes("timestamp") ||
          h.includes("date") ||
          h.includes("time")
      ),
    };

    for (let i = 1; i < records.length; i++) {
      const vals = records[i];
      if (vals.every((v) => !v)) continue;

      const rawStatus = idx.status >= 0 ? (vals[idx.status] ?? "") : "";
      const message = idx.message >= 0 ? (vals[idx.message] ?? "") : "";

      let status: ContactStatus;
      let motivoFalha: string | undefined;

      if (ALL_STATUSES.includes(rawStatus as ContactStatus)) {
        status = rawStatus as ContactStatus;
      } else {
        status = inferStatus(message);
      }

      if (status === "Failed" && message.trim()) {
        motivoFalha = extractFailureReason(message);
      }

      contacts.push({
        contactId: idx.id >= 0 ? (vals[idx.id] ?? "") : "",
        nome: idx.name >= 0 ? (vals[idx.name] ?? "") : "",
        telefone: idx.phone >= 0 ? (vals[idx.phone] ?? "") : "",
        status,
        dataAtualizacao:
          idx.timestamp >= 0 ? (vals[idx.timestamp] ?? "") : "",
        motivoFalha,
      });
    }
  } else {
    // Legacy format: Nome, Telefone, Status, Data da atualização
    const idx = {
      nome: headers.findIndex(
        (h) =>
          h.includes("nome") || h.includes("name") || h.includes("contato")
      ),
      telefone: headers.findIndex(
        (h) =>
          h.includes("telefone") ||
          h.includes("phone") ||
          h.includes("tel") ||
          h.includes("numero")
      ),
      status: headers.findIndex((h) => h.includes("status")),
      data: headers.findIndex(
        (h) =>
          h.includes("data") ||
          h.includes("date") ||
          h.includes("atualiz") ||
          h.includes("update")
      ),
      respondeu: headers.findIndex(
        (h) =>
          h.includes("respondeu") ||
          h.includes("replied") ||
          h.includes("resposta")
      ),
    };

    for (let i = 1; i < records.length; i++) {
      const vals = records[i];
      if (vals.every((v) => !v)) continue;

      const rawStatus = idx.status >= 0 ? vals[idx.status] : "";
      const status: ContactStatus = ALL_STATUSES.includes(
        rawStatus as ContactStatus
      )
        ? (rawStatus as ContactStatus)
        : "Sent";

      contacts.push({
        nome: idx.nome >= 0 ? (vals[idx.nome] ?? "") : "",
        telefone: idx.telefone >= 0 ? (vals[idx.telefone] ?? "") : "",
        status,
        dataAtualizacao: idx.data >= 0 ? (vals[idx.data] ?? "") : "",
        respondeu:
          idx.respondeu >= 0
            ? vals[idx.respondeu]?.toLowerCase() === "sim"
            : undefined,
      });
    }
  }

  return {
    id: `${fileName}-${Date.now()}`,
    name: nameFromFileName(fileName),
    fileName,
    contacts: deduplicateContacts(contacts),
    uploadedAt: new Date(),
  };
}
