"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCampaigns } from "@/context/CampaignContext";
import { useReplies } from "@/lib/useReplies";
import { calculateMetrics } from "@/lib/utils";
import { Header } from "@/components/dashboard/Header";
import { TrioLogo } from "@/components/TrioLogo";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { ContactsTable } from "@/components/dashboard/ContactsTable";
import { CampaignBreakdown } from "@/components/dashboard/CampaignBreakdown";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Upload } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { campaigns, updateReplies } = useCampaigns();
  const { loadReplies, isLoading: loadingReplies, progress: repliesProgress, error: repliesError } = useReplies();
  const [selectedId, setSelectedId] = useState<string>("all");
  const processedRef = useRef(new Set<string>());

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedId) ?? null,
    [campaigns, selectedId]
  );

  const allContacts = useMemo(
    () => campaigns.flatMap((c) => c.contacts),
    [campaigns]
  );

  const activeContacts = selectedId === "all"
    ? allContacts
    : (selectedCampaign?.contacts ?? []);

  const metrics = useMemo(
    () => calculateMetrics(activeContacts),
    [activeContacts]
  );

  // Trigger reply lookup automatically for newly added campaigns
  const campaignKeys = campaigns.map((c) => c.id).join(",");
  useEffect(() => {
    const pending = campaigns.filter(
      (c) =>
        c.contacts.length > 0 &&
        !processedRef.current.has(c.id) &&
        !c.contacts.some((ct) => ct.respondeu !== undefined)
    );
    if (pending.length === 0) return;

    pending.forEach((c) => processedRef.current.add(c.id));

    let cancelled = false;
    (async () => {
      for (const campaign of pending) {
        if (cancelled) break;
        await loadReplies(campaign.contacts, (replies) => {
          if (!cancelled) updateReplies(campaign.id, replies);
        });
      }
    })();

    return () => {
      cancelled = true;
      // Reset so the second Strict Mode run (or a real remount before replies
      // saved) can re-process. The respondeu !== undefined guard above prevents
      // re-processing once replies are actually stored.
      pending.forEach((c) => processedRef.current.delete(c.id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignKeys]);

  // Empty state
  if (campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white border border-gold/20 flex items-center justify-center mx-auto mb-4">
            <Upload className="h-7 w-7 text-trio-muted" />
          </div>
          <h2 className="font-baskerville text-2xl font-bold text-trio-text">
            Nenhum dado disponível
          </h2>
          <p className="mt-2 text-trio-muted text-sm">
            Faça upload dos arquivos CSV na página inicial para visualizar o
            dashboard.
          </p>
        </div>
        <Button onClick={() => router.push("/")} variant="primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao upload
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {loadingReplies && (
        <div className="fixed top-16 left-0 right-0 z-50">
          <div className="h-[2px] bg-gold/10 w-full">
            <div
              className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold/60 transition-all duration-500 ease-out"
              style={{ width: `${repliesProgress}%` }}
            />
          </div>
          <div className="absolute right-6 top-2 flex items-center gap-2 bg-white/90 border border-gold/20 rounded-full px-3 py-1 shadow-sm">
            <svg className="animate-spin h-3 w-3 text-gold" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[11px] text-trio-muted font-medium">
              Buscando respostas · {repliesProgress}%
            </span>
          </div>
        </div>
      )}

      <Header
        campaigns={campaigns}
        selectedId={selectedId}
        onSelectChange={(id) => setSelectedId(id)}
      />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Back button */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/")}
          >
            <Plus className="h-4 w-4" />
            Adicionar campanhas
          </Button>

          <div className="text-right">
            <p className="text-xs text-trio-muted">
              {campaigns.length} campanha{campaigns.length !== 1 ? "s" : ""} ·{" "}
              {allContacts.length.toLocaleString("pt-BR")} contatos totais
            </p>
          </div>
        </div>

        {/* Metric cards */}
        <MetricsCards metrics={metrics} />

        {!loadingReplies && repliesError && (
          <p className="text-xs text-red-500 text-center -mt-2">
            Erro ao buscar respostas: {repliesError}
          </p>
        )}

        {/* Content based on selection */}
        {selectedId === "all" ? (
          <CampaignBreakdown campaigns={campaigns} isLoadingReplies={loadingReplies} />
        ) : selectedCampaign ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <DonutChart
                contacts={selectedCampaign.contacts}
                campaignName={selectedCampaign.name}
              />
            </div>
            <div className="lg:col-span-3">
              <ContactsTable contacts={selectedCampaign.contacts} />
            </div>
          </div>
        ) : null}
      </main>

      <footer className="border-t border-gold/10 py-6 text-center">
        <div className="opacity-30"><TrioLogo width={48} /></div>
        <p className="text-xs text-trio-muted mt-2">
          Grupo TRIO · Report de Campanhas WhatsApp
        </p>
      </footer>
    </div>
  );
}
