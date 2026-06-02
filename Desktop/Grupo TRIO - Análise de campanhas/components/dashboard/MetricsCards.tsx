import { Card, CardContent } from "@/components/ui/card";
import { CampaignMetrics } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";
import {
  Users,
  Send,
  CheckCircle,
  BookOpen,
  AlertCircle,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}

function MetricCard({ label, value, sub, icon, accent }: MetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-trio-muted uppercase tracking-[0.15em]">
              {label}
            </p>
            <p
              className="mt-2 text-4xl font-baskerville font-bold leading-none tracking-tight"
              style={accent ? { color: accent } : undefined}
            >
              {value}
            </p>
            {sub && (
              <p className="mt-1.5 text-[11px] text-trio-muted/70">{sub}</p>
            )}
          </div>
          <div
            className="rounded-lg p-2.5 flex-shrink-0"
            style={
              accent
                ? { backgroundColor: `${accent}18`, color: accent }
                : { backgroundColor: "#C9A84C18", color: "#C9A84C" }
            }
          >
            {icon}
          </div>
        </div>
        <div
          className="mt-3 h-0.5 rounded-full opacity-20"
          style={accent ? { backgroundColor: accent } : { backgroundColor: "#C9A84C" }}
        />
      </CardContent>
    </Card>
  );
}

interface MetricsCardsProps {
  metrics: CampaignMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const hasReplyData = metrics.hasReplyData;

  const cards = [
    {
      label: "Total impactados",
      value: formatNumber(metrics.total),
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Enviados",
      value: formatNumber(metrics.total),
      icon: <Send className="h-5 w-5" />,
      accent: "#6b6862",
    },
    {
      label: "Entregues",
      value: formatNumber(metrics.delivered),
      sub: `${formatPercent(
        metrics.total > 0 ? (metrics.delivered / metrics.total) * 100 : 0
      )} do total (Lido + Entregue)`,
      icon: <CheckCircle className="h-5 w-5" />,
      accent: "#1a4f7a",
    },
    {
      label: "Lidos",
      value: formatNumber(metrics.read),
      sub: `${formatPercent(
        metrics.total > 0 ? (metrics.read / metrics.total) * 100 : 0
      )} do total`,
      icon: <BookOpen className="h-5 w-5" />,
      accent: "#1a7a4a",
    },
    {
      label: "Com erro",
      value: formatNumber(metrics.failed),
      sub: metrics.failed > 0
        ? `${formatPercent((metrics.failed / metrics.total) * 100)} do total`
        : "Nenhum erro",
      icon: <AlertCircle className="h-5 w-5" />,
      accent: "#9c2828",
    },
    {
      label: "Taxa de leitura",
      value: formatPercent(metrics.readRate),
      sub: `${formatNumber(metrics.read)} de ${formatNumber(metrics.total)}`,
      icon: <TrendingUp className="h-5 w-5" />,
      accent: "#C9A84C",
    },
    ...(hasReplyData
      ? [
          {
            label: "Responderam",
            value: formatNumber(metrics.replied),
            sub: `${formatPercent(metrics.replyRate)} do total`,
            icon: <MessageCircle className="h-5 w-5" />,
            accent: "#1a7a4a",
          },
          {
            label: "Taxa de resposta",
            value: formatPercent(metrics.replyRate),
            sub: `${formatNumber(metrics.replied)} de ${formatNumber(metrics.total)}`,
            icon: <TrendingUp className="h-5 w-5" />,
            accent: "#1a7a4a",
          },
        ]
      : []),
  ];

  const gridCols = hasReplyData
    ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4"
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4";

  return (
    <div className={gridCols}>
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}
