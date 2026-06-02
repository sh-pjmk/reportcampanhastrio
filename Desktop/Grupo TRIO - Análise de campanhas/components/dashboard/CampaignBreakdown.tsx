import { Campaign } from "@/types";
import { calculateMetrics, formatNumber, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CampaignBreakdownProps {
  campaigns: Campaign[];
  isLoadingReplies?: boolean;
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5 text-gold/50"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function CampaignBreakdown({
  campaigns,
  isLoadingReplies,
}: CampaignBreakdownProps) {
  if (campaigns.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Resumo por campanha</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 border-b border-gold/20">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-trio-muted uppercase tracking-wider border-r border-gold/10">
                  Campanha
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-trio-muted uppercase tracking-wider border-r border-gold/10">
                  Total
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-trio-muted uppercase tracking-wider hidden sm:table-cell border-r border-gold/10">
                  Lidos
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-trio-muted uppercase tracking-wider hidden md:table-cell border-r border-gold/10">
                  Entregues
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-trio-muted uppercase tracking-wider hidden lg:table-cell border-r border-gold/10">
                  Erros
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-trio-muted uppercase tracking-wider border-r border-gold/10">
                  Taxa leitura
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-trio-muted uppercase tracking-wider">
                  Responderam
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, i) => {
                const m = calculateMetrics(campaign.contacts);
                return (
                  <tr
                    key={campaign.id}
                    className={`border-b border-gold/10 hover:bg-gold/5 transition-colors ${
                      i === campaigns.length - 1 ? "border-0" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 border-r border-gold/10">
                      <div>
                        <p className="font-medium text-trio-text truncate max-w-[200px]">
                          {campaign.name}
                        </p>
                        <p className="text-[11px] text-trio-muted mt-0.5">
                          {campaign.fileName}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-medium text-trio-text border-r border-gold/10">
                      {formatNumber(m.total)}
                    </td>
                    <td className="px-4 py-3.5 text-right hidden sm:table-cell border-r border-gold/10">
                      <span className="text-status-read font-medium">
                        {formatNumber(m.read)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell border-r border-gold/10">
                      <span className="text-status-delivered font-medium">
                        {formatNumber(m.delivered)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden lg:table-cell border-r border-gold/10">
                      {m.failed > 0 ? (
                        <span className="text-status-failed font-medium">
                          {formatNumber(m.failed)}
                        </span>
                      ) : (
                        <span className="text-trio-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right border-r border-gold/10">
                      <span
                        className={`font-semibold ${
                          m.readRate >= 50
                            ? "text-status-read"
                            : m.readRate >= 20
                            ? "text-gold"
                            : "text-trio-muted"
                        }`}
                      >
                        {formatPercent(m.readRate)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isLoadingReplies ? (
                        <span className="inline-flex items-center justify-end">
                          <Spinner />
                        </span>
                      ) : m.replied > 0 ? (
                        <span className="text-status-read font-semibold">
                          {formatNumber(m.replied)}
                        </span>
                      ) : (
                        <span className="text-trio-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
