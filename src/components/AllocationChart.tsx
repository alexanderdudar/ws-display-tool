"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Holding, Currency, SECURITY_TYPE_MAP, getAccountDisplayName } from "@/lib/types";
import { getValueInCurrency } from "@/lib/hooks";
import { aggregateBySymbol } from "@/lib/aggregate";
import { getColorForSector, getColorByIndex, CATEGORY_COLORS } from "@/lib/colors";
import { getETFBreakdown } from "@/lib/etf-breakdown";
import { TOOLTIP_STYLE, TOOLTIP_ITEM_STYLE, TOOLTIP_LABEL_STYLE, formatChartValue } from "@/lib/chart-utils";

import { ViewMode } from "./Dashboard";

interface Props {
  holdings: Holding[];
  currency: Currency;
  hidden: boolean;
  viewMode: ViewMode;
}

function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function AllocationChart({ holdings, currency, hidden, viewMode: view }: Props) {

  const data = useMemo(() => {
    if (view === "holding") {
      return aggregateBySymbol(holdings, currency)
        .filter((p) => p.totalValue > 0)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 15)
        .map((p, i) => ({
          name: p.symbol,
          value: p.totalValue,
          color: getColorByIndex(i),
        }));
    }

    const groups: Record<string, number> = {};
    for (const h of holdings) {
      const val = getValueInCurrency(h, currency);
      if (view === "sector") {
        const breakdown = getETFBreakdown(h.symbol);
        if (breakdown) {
          for (const [sector, weight] of Object.entries(breakdown)) {
            groups[sector] = (groups[sector] || 0) + val * weight;
          }
        } else {
          const key = h.sector || "Other";
          groups[key] = (groups[key] || 0) + val;
        }
      } else {
        const key = view === "account" ? getAccountDisplayName(h.accountName) : (SECURITY_TYPE_MAP[h.securityType] || h.securityType);
        groups[key] = (groups[key] || 0) + val;
      }
    }

    return Object.entries(groups)
      .map(([name, value], i) => ({
        name,
        value,
        color: view === "sector" ? getColorForSector(name) : CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, currency, view]);

  const chartData = useMemo(() => {
    const withoutOther = data.filter((d) => d.name !== "Other");
    const existingOther = data.find((d) => d.name === "Other");

    if (withoutOther.length <= 14) {
      if (existingOther) return [...withoutOther, existingOther];
      return withoutOther;
    }

    const top = withoutOther.slice(0, 14);
    const rest = withoutOther.slice(14);
    const otherValue = rest.reduce((s, d) => s + d.value, 0) + (existingOther?.value || 0);
    return [...top, { name: "Other", value: otherValue, color: "#636366" }];
  }, [data]);

  const total = useMemo(() => chartData.reduce((s, d) => s + d.value, 0), [chartData]);

  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-[18px] border border-black/5 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-5 h-[420px] flex items-center gap-4">
      <div className="w-[45%] h-full flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="82%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              animationDuration={300}
              style={{ cursor: "default" }}
            >
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatChartValue(Number(value), currency, hidden)}
              contentStyle={TOOLTIP_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              cursor={{ fill: "rgba(255,255,255,0.1)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto max-h-full py-2">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-[14px]">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-[#1d1d1f] dark:text-[#f5f5f7] truncate flex-1">
              {d.name}
            </span>
            <span className="text-[#86868b] tabular-nums text-right flex-shrink-0">
              {hidden ? "•••" : formatChartValue(d.value, currency, false)}
            </span>
            <span className="text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums w-12 text-right flex-shrink-0">
              {hidden ? "••" : `${((d.value / total) * 100).toFixed(1)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
