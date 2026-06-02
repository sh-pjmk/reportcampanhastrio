"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Contact,
  ContactStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  ALL_STATUSES,
} from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";

interface DonutChartProps {
  contacts: Contact[];
  campaignName: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { total: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const total = item.payload.total;
  return (
    <div className="bg-white border border-gold/20 rounded-lg px-3 py-2 shadow-card-hover text-sm">
      <p className="font-medium text-trio-text">{item.name}</p>
      <p className="text-trio-muted">
        {formatNumber(item.value)} contatos (
        {formatPercent(total > 0 ? (item.value / total) * 100 : 0)})
      </p>
    </div>
  );
}

interface LegendPayload {
  value: string;
  color: string;
  payload: { count: number; total: number };
}

function CustomLegend({ payload }: { payload?: LegendPayload[] }) {
  if (!payload) return null;
  return (
    <ul className="flex flex-col gap-2 mt-2">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-trio-muted truncate">{entry.value}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-medium text-trio-text">
              {formatNumber(entry.payload.count)}
            </span>
            <span className="text-trio-muted">
              {formatPercent(
                entry.payload.total > 0
                  ? (entry.payload.count / entry.payload.total) * 100
                  : 0
              )}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DonutChart({ contacts, campaignName }: DonutChartProps) {
  const total = contacts.length;

  const data = ALL_STATUSES.map((status: ContactStatus) => ({
    name: STATUS_LABELS[status],
    status,
    count: contacts.filter((c) => c.status === status).length,
    total,
    fill: STATUS_COLORS[status],
  })).filter((d) => d.count > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-trio-muted text-sm text-center py-8">
            Nenhum dado disponível.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Distribuição de status</CardTitle>
        <p className="text-xs text-trio-muted">{campaignName}</p>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="count"
                nameKey="name"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="font-baskerville text-2xl font-bold text-trio-text leading-none">
              {formatNumber(total)}
            </p>
            <p className="text-[10px] text-trio-muted mt-0.5">contatos</p>
          </div>
        </div>

        <CustomLegend
          payload={data.map((d) => ({
            value: d.name,
            color: d.fill,
            payload: { count: d.count, total: d.total },
          }))}
        />
      </CardContent>
    </Card>
  );
}
