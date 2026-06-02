export type ContactStatus =
  | "Read"
  | "Delivered"
  | "Sent"
  | "Failed"
  | "Pending"
  | "Ignored";

export interface Contact {
  contactId?: string;
  nome: string;
  telefone: string;
  status: ContactStatus;
  dataAtualizacao: string;
  respondeu?: boolean;
  motivoFalha?: string;
}

export interface Campaign {
  id: string;
  name: string;
  fileName: string;
  contacts: Contact[];
  uploadedAt: Date;
}

export interface CampaignMetrics {
  total: number;
  read: number;
  delivered: number;
  sent: number;
  failed: number;
  pending: number;
  ignored: number;
  readRate: number;
  replied: number;
  replyRate: number;
  hasReplyData: boolean;
}

export const STATUS_LABELS: Record<ContactStatus, string> = {
  Read: "Lido",
  Delivered: "Entregue",
  Sent: "Enviado",
  Failed: "Falhou",
  Pending: "Pendente",
  Ignored: "Ignorado",
};

export const STATUS_COLORS: Record<ContactStatus, string> = {
  Read: "#1a7a4a",
  Delivered: "#1a4f7a",
  Sent: "#6b6862",
  Failed: "#9c2828",
  Pending: "#7a5c1a",
  Ignored: "#7a3c1a",
};

export const STATUS_BG_COLORS: Record<ContactStatus, string> = {
  Read: "#e8f5ee",
  Delivered: "#e8eef5",
  Sent: "#eeeded",
  Failed: "#f5e8e8",
  Pending: "#f5f0e8",
  Ignored: "#f5ebe8",
};

export const ALL_STATUSES: ContactStatus[] = [
  "Read",
  "Delivered",
  "Sent",
  "Failed",
  "Pending",
  "Ignored",
];
