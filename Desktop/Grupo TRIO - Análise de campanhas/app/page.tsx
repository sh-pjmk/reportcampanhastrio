"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCampaigns } from "@/context/CampaignContext";
import { parseCSV } from "@/lib/csvParser";
import { Campaign } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  X,
  ArrowRight,
  CheckCircle2,
  Users,
} from "lucide-react";
import { TrioLogo } from "@/components/TrioLogo";

export default function UploadPage() {
  const router = useRouter();
  const { campaigns, addCampaign, removeCampaign } = useCampaigns();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsProcessing(true);
      const fileArray = Array.from(files).filter((f) =>
        f.name.toLowerCase().endsWith(".csv")
      );

      for (const file of fileArray) {
        const text = await file.text();
        const campaign = parseCSV(text, file.name);
        addCampaign(campaign);
      }
      setIsProcessing(false);
    },
    [addCampaign]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  const totalContacts = campaigns.reduce(
    (sum, c) => sum + c.contacts.length,
    0
  );

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-trio-wine border-b border-gold/20">
        <div className="max-w-3xl mx-auto px-8 py-4 flex items-center justify-between">
          <TrioLogo width={110} />
          <div className="text-right">
            <p className="font-baskerville text-lg font-semibold text-gold tracking-wide">
              Report de Campanhas
            </p>
            <p className="text-gold/50 text-xs tracking-wide">
              WhatsApp · GoHighLevel
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-6">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none ${
            isDragging
              ? "border-gold bg-gold/5 drop-zone-active scale-[1.01]"
              : "border-gold/30 bg-white hover:border-gold/60 hover:bg-gold/3"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv"
            className="sr-only"
            onChange={handleFileInput}
          />

          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                isDragging ? "bg-gold/20" : "bg-cream"
              }`}
            >
              <Upload
                className={`h-7 w-7 transition-colors ${
                  isDragging ? "text-gold" : "text-trio-muted"
                }`}
              />
            </div>

            <p className="text-trio-text font-medium text-base">
              {isDragging
                ? "Solte os arquivos aqui"
                : "Arraste seus arquivos CSV aqui"}
            </p>
            <p className="text-trio-muted text-sm mt-1">
              ou{" "}
              <span className="text-gold font-medium underline underline-offset-2">
                clique para selecionar
              </span>
            </p>
            <p className="text-trio-muted/60 text-xs mt-3">
              Suporta múltiplos arquivos · Exportados do GoHighLevel
            </p>
          </div>

          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
              <div className="flex items-center gap-2 text-trio-wine">
                <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Processando...</span>
              </div>
            </div>
          )}
        </div>

        {/* File list */}
        {campaigns.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-baskerville text-xl font-semibold text-trio-text">
                Arquivos carregados
              </h2>
              <span className="text-xs text-trio-muted bg-white border border-gold/20 px-2.5 py-1 rounded-full">
                <Users className="h-3 w-3 inline mr-1" />
                {totalContacts.toLocaleString("pt-BR")} contatos
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {campaigns.map((campaign: Campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center gap-3 bg-white border border-gold/20 rounded-xl px-4 py-3.5 group hover:border-gold/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-gold" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-trio-text text-sm truncate">
                      {campaign.name}
                    </p>
                    <p className="text-xs text-trio-muted mt-0.5 truncate">
                      {campaign.fileName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-trio-text">
                        {campaign.contacts.length.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-[10px] text-trio-muted">contatos</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-status-read flex-shrink-0" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCampaign(campaign.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-trio-muted hover:text-red-600"
                      aria-label="Remover campanha"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            onClick={() => router.push("/dashboard")}
            disabled={campaigns.length === 0}
            className="gap-2 shadow-sm"
          >
            Ver Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-trio-muted/60">
              Carregue pelo menos um arquivo CSV para continuar
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
