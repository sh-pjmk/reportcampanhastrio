"use client";

import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { fetchReplies } from "./fetchReplies";

const HOOK_BATCH_SIZE = 20;

export function useReplies() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const loadReplies = useCallback(
    async (
      contacts: Contact[],
      onUpdate: (replies: Record<string, boolean>) => void
    ) => {
      // Only fetch replies for contacts that actually received the message
      const identifiers = contacts
        .filter(
          (c) =>
            c.status === "Read" ||
            c.status === "Delivered" ||
            c.status === "Sent"
        )
        .map((c) => ({ contactId: c.contactId, phone: c.telefone, sentAt: c.dataAtualizacao }))
        .filter((c) => c.contactId || c.phone);

      if (identifiers.length === 0) return;

      setIsLoading(true);
      setError(null);
      setProgress(0);

      const totalBatches = Math.ceil(identifiers.length / HOOK_BATCH_SIZE);

      try {
        for (let i = 0; i < identifiers.length; i += HOOK_BATCH_SIZE) {
          const batch = identifiers.slice(i, i + HOOK_BATCH_SIZE);
          const replies = await fetchReplies(batch);
          onUpdate(replies);
          const batchDone = Math.floor(i / HOOK_BATCH_SIZE) + 1;
          setProgress(Math.round((batchDone / totalBatches) * 100));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao buscar respostas"
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { loadReplies, isLoading, error, progress };
}
