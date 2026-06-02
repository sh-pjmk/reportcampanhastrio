"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Campaign } from "@/types";
import { TrioLogo } from "@/components/TrioLogo";

interface HeaderProps {
  campaigns: Campaign[];
  selectedId: string;
  onSelectChange: (id: string) => void;
}

export function Header({ campaigns, selectedId, onSelectChange }: HeaderProps) {
  return (
    <header className="bg-trio-wine border-b-2 border-gold/30 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <TrioLogo width={52} />
        </div>

        {/* Campaign selector */}
        <div className="w-56 flex-shrink-0">
          <Select value={selectedId} onValueChange={onSelectChange}>
            <SelectTrigger className="bg-white/10 border border-gold/40 text-gold hover:bg-white/15 hover:border-gold/60 focus:ring-1 focus:ring-gold/40 h-9 text-sm font-medium tracking-wide rounded-lg transition-all duration-200 [&>span]:truncate">
              <SelectValue placeholder="Selecionar campanha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as campanhas</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
