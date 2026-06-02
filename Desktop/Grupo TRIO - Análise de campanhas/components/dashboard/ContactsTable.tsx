"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Contact,
  ContactStatus,
  STATUS_LABELS,
  ALL_STATUSES,
} from "@/types";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

const PAGE_SIZE = 25;

interface ContactsTableProps {
  contacts: Contact[];
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [page, setPage] = useState(1);

  const hasReplyData = contacts.some((c) => c.respondeu !== undefined);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return contacts.filter((c) => {
      const matchesSearch =
        !q ||
        c.nome.toLowerCase().includes(q) ||
        c.telefone.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilter(value: ContactStatus | "all") {
    setStatusFilter(value);
    setPage(1);
  }

  const hasActiveFilter = search || statusFilter !== "all";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Contatos</CardTitle>
          <span className="text-xs text-trio-muted bg-cream px-2 py-1 rounded-full">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-trio-muted" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              handleStatusFilter(e.target.value as ContactStatus | "all")
            }
            className="h-9 rounded-md border border-gold/30 bg-white px-3 text-sm text-trio-text focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors cursor-pointer"
          >
            <option value="all">Todos os status</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPage(1);
              }}
              className="h-9 px-3 text-trio-muted hover:text-trio-wine"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpar filtros</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="border-r border-gold/10">Nome</TableHead>
                <TableHead className="border-r border-gold/10">Telefone</TableHead>
                <TableHead className="border-r border-gold/10">Status</TableHead>
                <TableHead className={`hidden md:table-cell${hasReplyData ? " border-r border-gold/10" : ""}`}>
                  Atualização
                </TableHead>
                {hasReplyData && <TableHead>Resposta</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={hasReplyData ? 5 : 4}
                    className="text-center text-trio-muted py-10"
                  >
                    {hasActiveFilter
                      ? "Nenhum contato encontrado com esses filtros."
                      : "Nenhum contato disponível."}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((contact, i) => (
                  <TableRow
                    key={`${contact.telefone}-${i}`}
                    className={i % 2 === 0 ? "bg-white" : "bg-cream/40"}
                  >
                    <TableCell className="font-semibold max-w-[180px] truncate border-r border-gold/10">
                      {contact.nome || "—"}
                    </TableCell>
                    <TableCell className="text-trio-muted font-mono text-xs border-r border-gold/10">
                      {contact.telefone || "—"}
                    </TableCell>
                    <TableCell className="border-r border-gold/10">
                      <StatusBadge status={contact.status} />
                    </TableCell>
                    <TableCell className={`hidden md:table-cell text-trio-muted text-xs ${hasReplyData ? "border-r border-gold/10" : ""}`}>
                      {contact.dataAtualizacao || "—"}
                    </TableCell>
                    {hasReplyData && (
                      <TableCell>
                        {contact.respondeu === true ? (
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: "#e8f5ee", color: "#1a7a4a" }}
                          >
                            Sim
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
                          >
                            Não
                          </span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gold/10 px-4 py-3">
            <p className="text-xs text-trio-muted">
              Pág. {safePage} de {totalPages} &middot; {filtered.length} contatos
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (safePage <= 3) {
                  pageNum = i + 1;
                } else if (safePage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = safePage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-7 w-7 rounded text-xs font-medium transition-colors ${
                      safePage === pageNum
                        ? "bg-trio-wine text-gold"
                        : "text-trio-muted hover:bg-gold/10"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
