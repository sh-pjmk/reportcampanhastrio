"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Campaign } from "@/types";

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  removeCampaign: (id: string) => void;
  clearCampaigns: () => void;
  updateReplies: (campaignId: string, replies: Record<string, boolean>) => void;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const addCampaign = (campaign: Campaign) => {
    setCampaigns((prev) => {
      const existing = prev.findIndex((c) => c.fileName === campaign.fileName);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = campaign;
        return updated;
      }
      return [...prev, campaign];
    });
  };

  const removeCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const clearCampaigns = () => setCampaigns([]);

  const updateReplies = useCallback(
    (campaignId: string, replies: Record<string, boolean>) => {
      setCampaigns((prev) =>
        prev.map((campaign) => {
          if (campaign.id !== campaignId) return campaign;
          return {
            ...campaign,
            contacts: campaign.contacts.map((contact) => ({
              ...contact,
              respondeu:
                contact.status === "Failed" ||
                contact.status === "Pending" ||
                contact.status === "Ignored"
                  ? false
                  : replies[contact.contactId || contact.telefone] ??
                    contact.respondeu,
            })),
          };
        })
      );
    },
    []
  );

  return (
    <CampaignContext.Provider
      value={{ campaigns, addCampaign, removeCampaign, clearCampaigns, updateReplies }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaigns must be inside CampaignProvider");
  return ctx;
}
